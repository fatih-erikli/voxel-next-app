"use client";

import Navigation from "./Navigation";
import { User } from "@/types/Auth";
import { SceneMode, Voxel, VoxelScene } from "@/types/Voxel";
import { Scene } from "./Scene";
import Link from "next/link";

export default function UserView({
  user,
  scenes,
  hasMore,
  nextOffset,
}: {
  user: User;
  scenes: VoxelScene[];
  hasMore: boolean;
  nextOffset: number;
}) {
  return (
    <>
      <Navigation title={user.username} />
      <div className="scene-list">
        {scenes.map((scene) => (
          <div className="scene-preview" key={scene.sceneId}>
            <Scene width={400} scale={10} height={400} sceneMode={SceneMode.View} voxels={scene.voxels} />
            <div className="scene-preview-title">
              <Link className="link" href={`/scenes/${scene.sceneId}`}>
                {scene.title}
              </Link>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="load-more">
          <Link className="link" href={`/users/${user.username}?offset=${nextOffset}`}>Next</Link>
        </div>
      )}
    </>
  );
}
