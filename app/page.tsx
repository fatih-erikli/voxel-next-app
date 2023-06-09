import Navigation from "@/components/Navigation";
import { Scene } from "@/components/Scene";
import { SceneMode, VoxelScene } from "@/types/Voxel";
import executeRedisQuery from "@/utils/execute-redis-query";
import Link from "next/link";

export default async function Home({ searchParams: { offset } }: { searchParams: { offset: string } }) {
  let rangeStart = 0;

  const requestedRangeStart = parseInt(offset);
  if (!isNaN(requestedRangeStart)) {
    rangeStart = requestedRangeStart;
  }

  const rangeEnd = rangeStart + 10;
  let scenes: VoxelScene[] = [];
  let count = 0;
  await executeRedisQuery(async (redis) => {
    count = await redis.lLen(`featured-content`);
    const sceneIds = await redis.lRange(`featured-content`, rangeStart, rangeEnd);
    for (const sceneId of sceneIds) {
      const scene: any = await redis.hGetAll(`scene:${sceneId}`);
      scenes.push({ ...scene, sceneId, user: { username: scene.user }, voxels: JSON.parse(scene.voxels) });
    }
  });
  const hasMore = count > rangeEnd;
  return (
    <>
      <Navigation title={"Featured content"} />
      <div className="scene-list">
        {scenes.map((scene) => (
          <div className="scene-preview" key={scene.sceneId}>
            <Scene width={400} height={400} sceneMode={SceneMode.View} voxels={scene.voxels} />
            <div className="scene-preview-title">
              <Link className="link" href={`/users/${scene.user.username}`}>
                {scene.user.username}
              </Link>{" "}
              /
              {" "}<Link className="link" href={`/scenes/${scene.sceneId}`}>
                {scene.title}
              </Link>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="load-more">
          <Link className="link" href={`/?offset=${rangeEnd}`}>
            Next
          </Link>
        </div>
      )}
    </>
  );
}
