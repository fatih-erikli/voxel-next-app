import { kv } from "@vercel/kv";
import UserView from "@/components/UserView";
import { VoxelScene } from "@/types/Voxel";
import { Metadata } from "next";

export async function generateMetadata({ params: { username } }: { params: { username: string } }): Promise<Metadata> {
  const user = await kv.hgetall<Record<string, string>>(`user:${username}`);
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
  const userExists = await kv.exists(`user:${username}`);

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
  const count = await kv.llen(`user-scenes:${username}`);
  const sceneIds = await kv.lrange(`user-scenes:${username}`, rangeStart, rangeEnd);
  for (const sceneId of sceneIds) {
    const scene: any = await kv.hgetall(`scene:${sceneId}`);
    scenes.push({ ...scene, sceneId, voxels: scene.voxels });
  }

  return <UserView scenes={scenes} user={user} hasMore={count > rangeEnd} nextOffset={rangeEnd} />;
}
