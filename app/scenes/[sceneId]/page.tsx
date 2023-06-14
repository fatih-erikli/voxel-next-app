import SceneView from "@/components/SceneView";
import { SceneMode } from "@/types/Voxel";
import executeRedisQuery from "@/utils/execute-redis-query";
import makeVoxelsCentered from "@/utils/make-voxels-centered";
import { Metadata } from "next";

export async function generateMetadata({ params: { sceneId } }: { params: { sceneId: string } }): Promise<Metadata> {
  const scene = await executeRedisQuery((redis) => redis.hGetAll(`scene:${sceneId}`));
  return {
    title: scene ? scene.title : "Iceland",
  };
}

export default async function SceneDetail({
  params: { sceneId },
  searchParams: { mode },
}: {
  params: { sceneId: string };
  searchParams: { mode: string };
}) {
  const scene = await executeRedisQuery((redis) => redis.hGetAll(`scene:${sceneId}`));

  if (!scene) {
    return <div>Not found.</div>;
  }
  const voxels = JSON.parse(scene.voxels);
  return (
    <SceneView
      sceneId={sceneId}
      mode={mode === "edit" ? SceneMode.Draw : SceneMode.View}
      title={scene.title}
      voxels={makeVoxelsCentered(voxels)}
    />
  );
}
