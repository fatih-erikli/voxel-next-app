"use client";
import LoginRequired from "@/components/LoginRequired";
import Navigation from "@/components/Navigation";
import { Scene } from "@/components/Scene";
import Tools from "@/components/Tools";
import { INITIAL_VOXEL } from "@/constants/voxels";
import AuthContext from "@/context/AuthContext";
import { Point3D, SceneMode, Voxel } from "@/types/Voxel";
import isEqualPoint3D from "@/utils/is-equal-point3d";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

export default function Create() {
  const [isSubmissionInProgress, setIsSubmissionInProgress] = useState(false);
  const [voxels, setVoxels] = useState<Voxel[]>([INITIAL_VOXEL]);
  const [title, setTitle] = useState("Untitled Scene");
  const [sceneMode, setSceneMode] = useState<SceneMode>(SceneMode.Draw);
  const [currentColor, setCurrentColor] = useState<string>(INITIAL_VOXEL.color);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 512, height: 512 });
  const { authToken } = useContext(AuthContext);
  const canvasRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const onSaveClick = async () => {
    setIsSubmissionInProgress(true);
    let response = await fetch(`/api/scenes`, {
      body: JSON.stringify({
        authToken,
        title,
        voxels,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    setIsSubmissionInProgress(false);
    let responseJson = await response.json();
    switch (response.status) {
      case 400:
        console.log(responseJson.err);
        break;

      case 201:
        router.push(`/scenes/${responseJson.createdSceneId}?mode=edit`);
        break;
    }
  };
  useEffect(() => {
    // consider using this maybe later https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
    const clientRect = canvasRef.current?.getBoundingClientRect();
    if (clientRect) {
      setSize({ width: clientRect.width, height: clientRect.height });
    }
  }, []);
  const onAddVoxel = (position: Point3D) => {
    setVoxels([...voxels, { position, color: currentColor }]);
  };
  const onDeleteVoxel = (position: Point3D) => {
    setVoxels(voxels.filter((voxel) => !isEqualPoint3D(voxel.position, position)));
  };
  return (
    <LoginRequired>
      <Navigation title={title} titleEditable onTitleChange={setTitle} />
      <div className="main">
        <div className="document-header">
          <Tools
            currentColor={currentColor}
            onChangeColor={setCurrentColor}
            onChangeSceneMode={setSceneMode}
            sceneMode={sceneMode}
          />
          <div className="document-actions">
            <button disabled={isSubmissionInProgress} onClick={onSaveClick}>
              {isSubmissionInProgress ? "Wait..." : "Save"}
            </button>
          </div>
        </div>
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
    </LoginRequired>
  );
}
