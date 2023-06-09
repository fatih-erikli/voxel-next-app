import { User } from "./Auth";

export type Point2D = { x: number; y: number };
export type Point3D = Point2D & { z: number };

export type Voxel = {
  color: string;
  position: Point3D;
};

export enum SceneMode {
  View,
  Draw,
  Delete,
}

export type VoxelScene = {sceneId: string; title: string, user: User; voxels: Voxel[]};
