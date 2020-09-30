import React, {DependencyList, FC, useContext, useEffect, useMemo, useRef} from "react";

import {useUpdate} from "./game";
import {Render2DFn, Render2DProvider} from "./types";


interface Render2DProps {
  width: number;
  height: number;
}

interface Render2DState {
  renderers: Render2DFn[];
}

const Render2DContext = React.createContext<Render2DProvider>(null);

export function useRender2D(fn: Render2DFn, deps: DependencyList | undefined): void {
  const provider = useContext(Render2DContext);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    provider.subscribe(fn);

    return () => provider.unsubscribe(fn);
  }, [fn, provider, ...deps]);
}


export const Render2D: FC<Render2DProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const stateRef = useRef<Render2DState>({
    renderers: []
  });

  const provider = useMemo(() => {
    return {
      subscribe: (fn: Render2DFn): void => {
        stateRef.current.renderers.push(fn);
      },

      unsubscribe: (fn: Render2DFn): void => {
        const idx = stateRef.current.renderers.indexOf(fn);
        if (idx >= 0) {
          stateRef.current.renderers.splice(idx, 1);
        }
      }
    };
  }, []);

  useUpdate((deltaTime: number) => {
    const state = stateRef.current;
    const context = canvasRef.current.getContext('2d');

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    state.renderers.forEach(renderer => renderer(context, deltaTime));
  }, []);

  return (
    <Render2DContext.Provider value={provider}>
      <canvas ref={canvasRef} width={props.width} height={props.height} />
      {props.children}
    </Render2DContext.Provider>
  );
};
