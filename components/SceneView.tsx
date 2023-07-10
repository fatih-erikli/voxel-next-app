"use client";

import { Point3D, SceneMode, Voxel } from "@/types/Voxel";
import { Scene } from "./Scene";
import Navigation from "./Navigation";
import Tools from "./Tools";
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { INITIAL_VOXEL } from "@/constants/voxels";
import AuthContext from "@/context/AuthContext";
import isEqualPoint3D from "@/utils/is-equal-point3d";
import SceneOnCanvas from "./SceneOnCanvas";
import { useRouter } from "next/navigation";

export default function SceneView({
  voxels: voxelsPrefetched,
  title: titlePrefetched,
  sceneId,
  mode: sceneModeInitial,
  renderer = "canvas",
}: {
  voxels: Voxel[];
  title: string;
  sceneId: string;
  mode: SceneMode;
  renderer: "svg" | "canvas";
}) {
  const [title, setTitle] = useState(titlePrefetched);
  const [isSaveInProgress, setIsSaveInProgress] = useState(false);
  const [voxels, setVoxels] = useState<Voxel[]>(voxelsPrefetched);
  const [sceneMode, setSceneMode] = useState<SceneMode>(sceneModeInitial);
  const [currentColor, setCurrentColor] = useState<string>(INITIAL_VOXEL.color);
  const [size, setSize] = useState<{ width: number; height: number; isCalculated: boolean }>({
    width: 512,
    height: 512,
    isCalculated: false,
  });
  const { authToken, sceneIds: userSceneIds } = useContext(AuthContext);
  const canvasRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(20);
  const router = useRouter();
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current!.getBoundingClientRect();
        setSize({ width, height, isCalculated: true });
      }
    });
    observer.observe(canvasRef.current!);
    // issue, resize observer does not work when a child component appended to the main
    return () => {
      observer.disconnect();
    };
  }, [sceneMode]);
  useEffect(() => {
    if (userSceneIds.includes(sceneId)) {
      setSceneMode(SceneMode.Draw);
    } else {
      setSceneMode(SceneMode.View);
    }
  }, [userSceneIds, sceneId]);
  const onSaveClick = async () => {
    setIsSaveInProgress(true);
    const response = await fetch(`/api/scenes/${sceneId}`, {
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
  const onDeleteSceneClick = async () => {
    if (window.confirm("Do you really want to delete the scene?")) {
      const response = await fetch(`/api/scenes/${sceneId}`, {
        body: JSON.stringify({
          authToken,
          deleteScene: true,
        }),
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 204) {
        router.push("/");
      }
    }
  };
  const onAddVoxel = (position: Point3D) => {
    setVoxels([...voxels, { position, color: currentColor }]);
  };
  const onDeleteVoxel = (position: Point3D) => {
    setVoxels(voxels.filter((voxel) => !isEqualPoint3D(voxel.position, position)));
  };
  const onScaleChange = (scale: number) => {
    setScale(scale);
  };
  const presentationMode = scale > 30;
  const isOwner = userSceneIds.includes(sceneId);
  return (
    <>
      {!presentationMode && <Navigation stickyHeader title={title} titleEditable={isOwner} onTitleChange={setTitle} />}
      <div className={"main full-screen"} ref={mainRef}>
        {(sceneMode === SceneMode.Draw || sceneMode === SceneMode.Delete) && !presentationMode && (
          <div className="document-header-full-screen">
            <>
              <Tools
                currentColor={currentColor}
                onChangeColor={setCurrentColor}
                onChangeSceneMode={setSceneMode}
                sceneMode={sceneMode}
              />
            </>
            <div className="document-actions">
              <button onClick={onDeleteSceneClick}>Delete</button>
              <button disabled={isSaveInProgress} onClick={onSaveClick}>
                {isSaveInProgress ? "Wait..." : "Save"}
              </button>
            </div>
          </div>
        )}
        <div className="canvas" ref={canvasRef}>
          {size.isCalculated ? (
            renderer === "canvas" ? (
              <SceneOnCanvas
                voxels={voxels}
                sceneMode={sceneMode}
                width={size.width}
                height={size.height}
                onAddVoxel={onAddVoxel}
                onDeleteVoxel={onDeleteVoxel}
              />
            ) : (
              <Scene
                onScaleChange={onScaleChange}
                voxels={voxels}
                sceneMode={sceneMode}
                width={size.width}
                height={size.height}
                onAddVoxel={onAddVoxel}
                onDeleteVoxel={onDeleteVoxel}
              />
            )
          ) : (
            <progress />
          )}
        </div>
      </div>
    </>
  );
}
