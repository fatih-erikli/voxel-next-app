import { kv } from '@vercel/kv';
import SceneView from "@/components/SceneView";
import { SceneMode } from "@/types/Voxel";
import makeVoxelsCentered from "@/utils/make-voxels-centered";
import { Metadata } from "next";

export async function generateMetadata({ params: { sceneId } }: { params: { sceneId: string } }): Promise<Metadata> {
  const scene = await kv.hgetall<Record<string, string>>(`scene:${sceneId}`);
  return {
    title: scene ? scene.title : "Iceland",
  };
}

export default async function SceneDetail({
  params: { sceneId },
  searchParams: { mode, renderer = "canvas" },
}: {
  params: { sceneId: string };
  searchParams: { mode: string; renderer: "canvas" | "svg" };
}) {
  const scene = await kv.hgetall<Record<string, any>>(`scene:${sceneId}`);

  if (!scene || !scene.voxels) {
    return <div>Not found.</div>;
  }
  return (
    <SceneView
      renderer={renderer}
      sceneId={sceneId}
      mode={mode === "edit" ? SceneMode.Draw : SceneMode.View}
      title={scene.title}
      voxels={makeVoxelsCentered(scene.voxels)}
    />
  );
}
