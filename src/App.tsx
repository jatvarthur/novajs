import React, {FC} from 'react';

import {Game} from "./engine/Game/game";
import {useRender2D} from "./engine/Game/render2d";


export const MainScreen: FC = () => {
  let angle = 0;

  useRender2D((context: CanvasRenderingContext2D, deltaTime: number) => {
    angle += 0.002 * deltaTime;

    context.save();
    try {
      context.strokeStyle="#FF0000";
      context.lineWidth = 3;

      context.translate(200, 200);
      context.rotate(angle);
      context.translate(-200, -200);

      context.strokeRect(100, 100, 200, 200);
    } finally {
      context.restore();
    }
  }, []);

  return null;
}


export const App: FC = () => {
    return (
      <Game width={1024} height={768}>
        <MainScreen />
      </Game>
    );
};
