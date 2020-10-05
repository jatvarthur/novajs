import {forwardRef, useEffect, useImperativeHandle, useRef} from "react";


export interface FrameDef {
  loc: { x: number, y: number, w: number, h: number },
  size: { w: number, h: number };
  length?: number;
}

export interface AtlasDef {
  frames: { [id: string]: FrameDef };
}

export interface AtlasData extends AtlasDef {
  image: HTMLImageElement
}

export interface AtlasRef {
  src: string;
  map: string
}

export interface SceneDef {
  scene: { [id: string]: SceneObjectDef };
  atlas?: { [id: string]: AtlasRef };
}

export interface SceneData {
  atlas: { [id: string]: AtlasData }
}

export type SceneObjectDef = { [componentId: string]: Record<string, unknown> };


function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Error loading: ${src}: ${e}`));
    img.src = src;
  });
}

function loadJson<T>(src: string): Promise<T> {
  return fetch(src)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json()
    });
}

async function loadScene(src: string) {
  const scene: SceneData = {
    atlas: {}
  };
  const sceneDef = await loadJson<SceneDef>(src);

  const loadList: Promise<void>[] = [];
  Object.keys(sceneDef.atlas || {}).forEach((id) => {
    const atlasRef = sceneDef.atlas[id];
    loadList.push(
      Promise.all([loadJson<AtlasDef>(atlasRef.src), loadImage(atlasRef.map)])
        .then(([atlasDef, image]) => {
          scene.atlas[id] = { ...atlasDef, image };
        })
        .catch(() => {
          scene.atlas[id] = { frames: {}, image: null }
        })
    );
  });

  await Promise.all(loadList);
  return scene;
}


interface SceneProps {
  src: string;
}

export interface SceneHandle {
  getAtlas(id: string): AtlasData | null;
}

export const Scene = forwardRef<SceneHandle, SceneProps>((props, ref) => {
  const sceneRef = useRef<SceneData>();

  useImperativeHandle(ref, () => {
    return {
      getAtlas(id: string): AtlasData | null {
        return sceneRef.current && sceneRef.current.atlas[id];
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      sceneRef.current = await loadScene(props.src);
    })();
  }, [props.src])

  return null;
});

Scene.displayName = "Scene";
