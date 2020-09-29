import React, {useCallback, useEffect, useRef} from "react";


interface WindowProps {
  width: number;
  height: number;
}

interface WindowState {
  prevTime: number;
  requestId: number;
  offscreenBuffer: HTMLCanvasElement;
}

/**
 * Main loop, events dispatcher and canvas presenter.
 */
export const Window = (props: WindowProps) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const stateRef = useRef<WindowState>({
    prevTime: 0,
    requestId: 0,
    offscreenBuffer: document.createElement('canvas')
  });

  stateRef.current.offscreenBuffer.width = props.width;
  stateRef.current.offscreenBuffer.height = props.height;

  let angle = 0;


  const doTick = useCallback((time: number) => {
    if (stateRef.current.prevTime) {
      const deltaTime = time = stateRef.current.prevTime;

      angle += 0.002 * deltaTime;

      const ctx = stateRef.current.offscreenBuffer.getContext("2d");
      ctx.save();
      try {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, props.width, props.height);

        ctx.strokeStyle="#FF0000";
        ctx.lineWidth = 3;

        ctx.translate(200, 200);
        ctx.rotate(angle);
        ctx.translate(-200, -200);

        ctx.strokeRect(100, 100, 200, 200);
      } finally {
        ctx.restore();
      }
    }

    canvasRef.current.getContext('2d').drawImage(stateRef.current.offscreenBuffer, 0, 0);

    stateRef.current.prevTime = time;
    stateRef.current.requestId = requestAnimationFrame(doTick);
  }, []);

  useEffect(() => {
    stateRef.current.requestId = requestAnimationFrame(doTick);

    return () => {
      cancelAnimationFrame(stateRef.current.requestId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} width={props.width} height={props.height} />
  );
}