import { Voxel } from "@/types/Voxel";

export default function makeVoxelsCentered(voxels: Voxel[]): Voxel[] {
  if (voxels.length === 0) {
    return voxels;
  }
  let minx = Infinity;
  let miny = Infinity;
  let minz = Infinity;
  let maxx = -Infinity;
  let maxy = -Infinity;
  let maxz = -Infinity;
  for (const voxel of voxels) {
    console.log(voxel.position)
    minx = Math.min(voxel.position.x, minx);
    miny = Math.min(voxel.position.y, miny);
    minz = Math.min(voxel.position.z, minz);
    maxx = Math.max(voxel.position.x, maxx);
    maxy = Math.max(voxel.position.y, maxy);
    maxz = Math.max(voxel.position.z, maxz);
  }
  const distancex = (maxx - minx);
  const distancey = (maxy - miny);
  const distancez = (maxz - minz);
  const centerx = distancex / 2;
  const centery = distancey / 2;
  const centerz = distancez / 2;
  return voxels.map((voxel) => ({
    ...voxel,
    position: {
      // x: voxel.position.x,
      // y: voxel.position.y,
      // z: voxel.position.z,
      x: (voxel.position.x - minx) - centerx,
      y: (voxel.position.y - miny) - centery,
      z: (voxel.position.z - minz) - centerz,
    },
  }));
}
