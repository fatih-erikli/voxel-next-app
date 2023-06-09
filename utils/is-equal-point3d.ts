import { Point3D } from "@/types/Voxel";

export default function isEqualPoint3D(a: Point3D, b: Point3D) {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}
