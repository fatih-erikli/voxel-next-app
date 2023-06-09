import { Voxel } from "@/types/Voxel";
import { MAX_VOXELS } from "@/constants/voxels";
import { enumerateIterable } from "@/utils/enumerate-iterable";
import Color from "color";

export default function cleanVoxelContent(content: any): {
  ok: boolean;
  voxels?: Voxel[];
  err?: string;
} {
  if (!Array.isArray(content)) {
    return { ok: false, err: "JSON content should be array of voxel objects." };
  }

  if (content.length > MAX_VOXELS) {
    return { ok: false, err: `Maximum ${MAX_VOXELS} amount of voxels allowed.` };
  }
  const cleanedContent: Voxel[] = [];
  let err;
  for (const [index, voxelContent] of enumerateIterable(content)) {
    if (!Object.hasOwn(voxelContent, "position")) {
      err = `${index} does not have a position field.`;
      break;
    }
    if (!Object.hasOwn(voxelContent, "color")) {
      err = `${index} does not have a color field.`;
      break;
    }
    const { color, position } = voxelContent;
    try {
      Color(color);
    } catch {
      err = `${index} does not have a valid color.`;
      break;
    }
    const cleanedPosition = {
      x: parseInt(voxelContent.position.x),
      y: parseInt(voxelContent.position.y),
      z: parseInt(voxelContent.position.z),
    }
    /*
    Worth to take a note on this
    > parseInt('Infinity')
    NaN
    > Number('Infinity')
    Infinity
    */
    if ([position.x, position.y, position.z].some((number: any) => isNaN(number))) {
      err = `${index} position field should be array of three numbers represent x, y, z.`;
      break;
    }
    cleanedContent.push({
      color,
      position: cleanedPosition,
    });
  }

  if (err) {
    return {
      ok: false,
      err,
    };
  } else {
    return {
      ok: true,
      voxels: cleanedContent,
    };
  }
}
