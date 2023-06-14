"use client";

import { Point3D, SceneMode, Voxel } from "@/types/Voxel";
import { Scene } from "./Scene";
import Navigation from "./Navigation";
import Tools from "./Tools";
import { PointerEventHandler, useContext, useEffect, useRef, useState } from "react";
import { INITIAL_VOXEL } from "@/constants/voxels";
import AuthContext from "@/context/AuthContext";
import isEqualPoint3D from "@/utils/is-equal-point3d";
import { downloadURI } from "@/utils/download-uri";

export default function SceneView({
  voxels: voxelsPrefetched,
  title: titlePrefetched,
  sceneId,
  mode: sceneModeInitial,
}: {
  voxels: Voxel[];
  title: string;
  sceneId: string;
  mode: SceneMode;
}) {
  const [title, setTitle] = useState(titlePrefetched);
  const [isSaveInProgress, setIsSaveInProgress] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [voxels, setVoxels] = useState<Voxel[]>(voxelsPrefetched);
  const [sceneMode, setSceneMode] = useState<SceneMode>(sceneModeInitial);
  const [currentColor, setCurrentColor] = useState<string>(INITIAL_VOXEL.color);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 512, height: 512 });
  const { authToken } = useContext(AuthContext);
  const canvasRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (authToken) {
      (async function () {
        let response = await fetch(`/api/scenes/${sceneId}/auth`, {
          body: JSON.stringify({ authToken }),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.status === 202) {
          setSceneMode(SceneMode.Draw);
          setIsOwner(true);
        }
      })();
    }
  }, [authToken, sceneId]);
  const onSaveClick = async () => {
    setIsSaveInProgress(true);
    let response = await fetch(`/api/scenes/${sceneId}`, {
      body: JSON.stringify({
        authToken,
        title,
        voxels,
      }),
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
    }
    setIsSaveInProgress(false);
  };
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current!.getBoundingClientRect();
        setSize({ width, height });
      }
    });
    observer.observe(canvasRef.current!);
    // issue, resize observer does not work when a child component appended to the main
    return () => {
      observer.disconnect();
    };
  }, [sceneMode]);
  const onAddVoxel = (position: Point3D) => {
    setVoxels([...voxels, { position, color: currentColor }]);
  };
  const onDeleteVoxel = (position: Point3D) => {
    setVoxels(voxels.filter((voxel) => !isEqualPoint3D(voxel.position, position)));
  };
  return (
    <>
      <Navigation title={title} titleEditable={isOwner} onTitleChange={setTitle} />
      <div className="main" ref={mainRef}>
        {(sceneMode === SceneMode.Draw || sceneMode === SceneMode.Delete) && (
          <div className="document-header">
            <>
              <Tools
                currentColor={currentColor}
                onChangeColor={setCurrentColor}
                onChangeSceneMode={setSceneMode}
                sceneMode={sceneMode}
              />
            </>
            <div className="document-actions">
              <button disabled={isSaveInProgress} onClick={onSaveClick}>
                {isSaveInProgress ? "Wait..." : "Save"}
              </button>
            </div>
          </div>
        )}
        <div className="canvas" ref={canvasRef}>
          <Scene
            voxels={voxels}
            sceneMode={sceneMode}
            width={size.width}
            height={size.height}
            onAddVoxel={onAddVoxel}
            onDeleteVoxel={onDeleteVoxel}
          />
        </div>
      </div>
    </>
  );
}
