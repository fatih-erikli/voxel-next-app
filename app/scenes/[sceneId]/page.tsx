import SceneView from "@/components/SceneView";
import { SceneMode } from "@/types/Voxel";
import executeRedisQuery from "@/utils/execute-redis-query";
import makeVoxelsCentered from "@/utils/make-voxels-centered";
import { Metadata } from "next";

export async function generateMetadata({ params: { sceneId } }: { params: { sceneId: string } }): Promise<Metadata> {
  const scene = await executeRedisQuery((redis) => redis.hGetAll(`scene:${sceneId}`));
  return {
    title: scene.title ? scene.title : "Iceland",
  };
}

export default async function SceneDetail({
  params: { sceneId },
  searchParams: { mode, renderer = "canvas" },
}: {
  params: { sceneId: string };
  searchParams: { mode: string; renderer: "canvas" | "svg" };
}) {
  const scene = await executeRedisQuery((redis) => redis.hGetAll(`scene:${sceneId}`));

  if (!scene || !scene.voxels) {
    return <div>Not found.</div>;
  }
  const voxels = JSON.parse(scene.voxels);
  return (
    <SceneView
      renderer={renderer}
      sceneId={sceneId}
      mode={mode === "edit" ? SceneMode.Draw : SceneMode.View}
      title={scene.title}
      voxels={makeVoxelsCentered(voxels)}
    />
  );
}
