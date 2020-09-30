
export interface Subscriber<T> {
  subscribe(fn: T): void;
  unsubscribe(fn: T): void;
}

export type UpdateFn = (deltaTime: number) => void;

export type GameLoopProvider = Subscriber<UpdateFn>;

export type Render2DFn = (context: CanvasRenderingContext2D, deltaTime: number) => void;

export type Render2DProvider = Subscriber<Render2DFn>;
