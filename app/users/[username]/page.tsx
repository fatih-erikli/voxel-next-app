import UserView from "@/components/UserView";
import { User } from "@/types/Auth";
import { VoxelScene } from "@/types/Voxel";
import executeRedisQuery from "@/utils/execute-redis-query";
import { Metadata } from "next";

export async function generateMetadata({ params: { username } }: { params: { username: string } }): Promise<Metadata> {
  const user = await executeRedisQuery((redis) => redis.hGetAll(`user:${username}`));
  return {
    title: user ? user.title : "Iceland",
  };
}

export default async function SceneDetail({
  params: { username },
  searchParams: { offset },
}: {
  params: { username: string };
  searchParams: { offset: string };
}) {
  let userExists;

  await executeRedisQuery(async (redis) => {
    userExists = await redis.exists(`user:${username}`);
  });

  if (!userExists) {
    return <div>Not found.</div>;
  }

  const user = { username };
  let rangeStart = 0;

  const requestedRangeStart = parseInt(offset);
  if (!isNaN(requestedRangeStart)) {
    rangeStart = requestedRangeStart;
  }

  const rangeEnd = rangeStart + 10;

  let scenes: VoxelScene[] = [];
  let count = 0;
  await executeRedisQuery(async (redis) => {
    count = await redis.lLen(`user-scenes:${username}`);

    const sceneIds = await redis.lRange(`user-scenes:${username}`, rangeStart, rangeEnd);
    for (const sceneId of sceneIds) {
      const scene: any = await redis.hGetAll(`scene:${sceneId}`);
      scenes.push({ ...scene, sceneId, voxels: JSON.parse(scene.voxels) });
    }
  });

  return <UserView scenes={scenes} user={user} hasMore={count > rangeEnd} nextOffset={rangeEnd} />;
}
