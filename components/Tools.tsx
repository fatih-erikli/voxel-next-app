import { SceneMode } from "@/types/Voxel";

export default function Tools({
  currentColor,
  onChangeColor,
  sceneMode,
  onChangeSceneMode
}: {
  currentColor: string;
  onChangeColor: (value: string) => void;
  sceneMode: SceneMode,
  onChangeSceneMode: (mode: SceneMode) => void
}) {
  return (
    <div className="tools">
      <div className="color-input">
        <input type={"color"} value={currentColor} onChange={(e) => onChangeColor(e.target.value)} />
      </div>
      <div className={"modes"}>
        <button onClick={() => onChangeSceneMode(SceneMode.Draw)} disabled={sceneMode === SceneMode.Draw}>
          Draw
        </button>
        <button onClick={() => onChangeSceneMode(SceneMode.Delete)} disabled={sceneMode === SceneMode.Delete}>
          Delete
        </button>
      </div>
    </div>
  );
}
