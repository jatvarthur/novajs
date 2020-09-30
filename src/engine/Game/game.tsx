import React, {DependencyList, FC, useCallback, useContext, useEffect, useMemo, useRef} from "react";

import {GameLoopProvider, UpdateFn} from "./types";
import {Render2D} from "./render2d";


interface GameProps {
  width: number;
  height: number;
}

interface GameState {
  prevTime: number;
  requestId: number;
  subscribers: UpdateFn[];
}

const GameLoopContext = React.createContext<GameLoopProvider>(null);

export function useUpdate(fn: UpdateFn, deps: DependencyList | undefined): void {
  const provider = useContext(GameLoopContext);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    provider.subscribe(fn);

    return () => provider.unsubscribe(fn);
  }, [fn, provider, ...deps]);
}

/**
 * Main loop.
 */
export const Game: FC<GameProps> = (props) => {
  const stateRef = useRef<GameState>({
    prevTime: 0,
    requestId: 0,
    subscribers: []
  });

  const provider = useMemo(() => {
    return {
      subscribe: (fn: UpdateFn): void => {
          stateRef.current.subscribers.push(fn);
        },

      unsubscribe: (fn: UpdateFn): void => {
        const idx = stateRef.current.subscribers.indexOf(fn);
        if (idx >= 0) {
          stateRef.current.subscribers.splice(idx, 1);
        }
      }
    };
  }, []);

  const doGameLoopTick = useCallback((time: number) => {
    const state = stateRef.current;
    if (state.prevTime) {
      const deltaTime = time - state.prevTime;
      state.subscribers.forEach(update => update(deltaTime));
    }

    state.prevTime = time;
    state.requestId = requestAnimationFrame(doGameLoopTick);
  }, []);

  useEffect(() => {
    const state = stateRef.current;
    state.requestId = requestAnimationFrame(doGameLoopTick);

    return () => {
      cancelAnimationFrame(state.requestId);
    };
  }, [doGameLoopTick]);

  return (
    <GameLoopContext.Provider value={provider}>
      <Render2D width={props.width} height={props.height}>
        {props.children}
      </Render2D>
    </GameLoopContext.Provider>
  );
};
