import React, {FC, useRef} from 'react';

import {Game} from "./engine/Game/game";
import {useRender2D} from "./engine/Game/render2d";
import {FrameDef, Scene, SceneHandle} from "./engine/Game/scene";


function drawSpriteFrame(context: CanvasRenderingContext2D, image: HTMLImageElement, frame: FrameDef,
                         x: number, y: number, frameNo: number): void {
  context.drawImage(image,
    frame.loc.x + frameNo * frame.size.w, frame.loc.y, frame.size.w, frame.size.h,
    x, y, frame.size.w, frame.size.h);
}

export const MainScreen: FC = () => {
  const sprites = useRef({
    frameNo: 0,
    lastTime: 0
  });

  const sceneRef = useRef<SceneHandle>();

  useRender2D((context: CanvasRenderingContext2D, deltaTime: number) => {
    const sprite = sprites.current;
    const atlas = sceneRef.current && sceneRef.current.getAtlas("knight");

    if (atlas) {
      context.save();
      try {
        context.translate(147, 147);
        context.rotate(-.9);
        context.translate(-147, -147);

        const legFrame = atlas.frames["walk"];
        drawSpriteFrame(context, atlas.image, legFrame, 100, 100, sprite.frameNo);
        const bodyFrame = atlas.frames["sword_slash_2"];
        drawSpriteFrame(context, atlas.image, bodyFrame, 100, 100, sprite.frameNo);
        const headFrame = atlas.frames["head_2"];
        drawSpriteFrame(context, atlas.image, headFrame, 100, 100, 0);

        const FRAME_TIME = 100;
        sprite.lastTime += deltaTime;
        if (sprite.lastTime > FRAME_TIME) {
          sprite.lastTime -= FRAME_TIME;
          sprite.frameNo += 1;
          if (sprite.frameNo >= (bodyFrame.length || 1)) {
            sprite.frameNo = 0;
          }
        }
      } finally {
        context.restore();
      }

    }
  }, []);

  return (
    <Scene ref={sceneRef} src={"main.scene.json"} />
  );
}


export const App: FC = () => {
  return (
    <Game width={1024} height={768}>
      <MainScreen />
    </Game>
  );
};
