"use client";
import Color from "color";
import { MAX_VOXELS } from "@/constants/voxels";
import { Point2D, Point3D, SceneMode, Voxel } from "@/types/Voxel";
import { enumerateIterable } from "@/utils/enumerate-iterable";
import { Mat4, Vec2, Vec3 } from "gl-matrix/dist/esm";
import { useEffect, useMemo, useRef, useState } from "react";

const CUBE_VERTEX: Vec3[] = [
  Vec3.fromValues(-1, 1, 1),
  Vec3.fromValues(1, 1, 1),
  Vec3.fromValues(1, -1, 1),
  Vec3.fromValues(-1, -1, 1),
  Vec3.fromValues(-1, 1, -1),
  Vec3.fromValues(1, 1, -1),
  Vec3.fromValues(1, -1, -1),
  Vec3.fromValues(-1, -1, -1),
];

const CUBE_FACES: number[][] = [
  [0, 1, 2, 3], // front
  [1, 5, 6, 2], // right
  [0, 4, 7, 3], // left
  [0, 4, 5, 1], // bottom
  [4, 5, 6, 7], // back
  [3, 7, 6, 2], // top
];

enum CubeFaceName {
  Front,
  Right,
  Left,
  Bottom,
  Back,
  Top,
}

function calculateNextVoxelPosition(position: Point3D, face: CubeFaceName, unitLength = 2): Point3D {
  switch (face) {
    case CubeFaceName.Top:
      return { x: position.x, y: position.y - unitLength, z: position.z };
    case CubeFaceName.Bottom:
      return { x: position.x, y: position.y + unitLength, z: position.z };
    case CubeFaceName.Left:
      return { x: position.x - unitLength, y: position.y, z: position.z };
    case CubeFaceName.Right:
      return { x: position.x + unitLength, y: position.y, z: position.z };
    case CubeFaceName.Front:
      return { x: position.x, y: position.y, z: position.z + unitLength };
    case CubeFaceName.Back:
      return { x: position.x, y: position.y, z: position.z - unitLength };
  }
}

function renderPolygonPoints(mesh: Vec3[]) {
  let result = "";
  for (const vec3 of mesh) {
    result += `${result && " "}${vec3.x}, ${vec3.y}`;
  }
  return result;
}

function clamp(number: number, min: number, max: number) {
  return Math.max(min, Math.min(max, number));
}

export function Scene({
  voxels,
  sceneMode,
  width,
  height,
  onAddVoxel,
  onDeleteVoxel,
  scale: scaleInitial = 20,
}: {
  voxels: Voxel[];
  sceneMode: SceneMode;
  width: number;
  height: number;
  onAddVoxel?: (position: Point3D) => void;
  onDeleteVoxel?: (position: Point3D) => void;
  scale?: number;
}) {
  const [azimuth, setAzimuth] = useState(110);
  const [elevation, setElevation] = useState(220);
  const [panTo, setPanTo] = useState<Point2D>({ x: 0, y: 0 });
  const [scale, setScale] = useState(scaleInitial);
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const element = svgRef.current!;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey) {
        setScale((scale) =>
          clamp(scale - (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX / 2 : event.deltaY / 2), 4, 200)
        );
      } else {
        const deltaX = event.deltaX / 4;
        const deltaY = event.deltaY / 4;
        setAzimuth((azimuth) => azimuth + deltaX);
        setElevation((elevation) => clamp(elevation - deltaY, 150, 226));
      }
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", onWheel);
    };
  }, []);
  const projection = useMemo(() => {
    const angleX = (azimuth / 180) * Math.PI;
    const angleY = (elevation / 180) * Math.PI;
    const mat4 = Mat4.create();
    Mat4.identity(mat4);
    Mat4.lookAt(
      mat4,
      Vec3.fromValues(Math.sin(angleX) * Math.cos(angleY), Math.sin(angleY), Math.cos(angleX) * Math.cos(angleY)),
      Vec3.fromValues(0, 0, 0),
      Vec3.fromValues(0, 1, 0)
    );
    Mat4.scale(mat4, mat4, Vec3.fromValues(scale, scale, scale));
    return mat4;
  }, [azimuth, elevation, scale]);
  const computedMesh = useMemo(() => {
    const mesh: [face: Vec3[], voxel: Voxel, faceIndex: number, voxelIndex: number][] = [];
    for (const [voxelIndex, voxel] of enumerateIterable(voxels)) {
      for (const [faceIndex, vertexIndexes] of enumerateIterable(CUBE_FACES)) {
        const face: Vec3[] = [];
        for (const vertexIndex of vertexIndexes) {
          const vertex = CUBE_VERTEX[vertexIndex];
          const vec3 = Vec3.fromValues(voxel.position.x, voxel.position.y, voxel.position.z);
          Vec3.add(vec3, vertex, vec3);
          Vec3.transformMat4(vec3, vec3, projection);
          face.push(vec3);
        }
        mesh.push([face, voxel, faceIndex, voxelIndex]);
      }
    }
    mesh.sort(([facea], [faceb]) => {
      let suma = 0;
      let sumb = 0;
      for (const mesh of facea) {
        suma += mesh.z;
      }
      for (const mesh of faceb) {
        sumb += mesh.z;
      }
      return suma / facea.length - sumb / faceb.length;
    });
    return mesh;
  }, [voxels, projection]);
  return (
    <svg
      ref={svgRef}
      touch-action="none"
      onContextMenu={(event) => event.preventDefault()}
      onPointerMove={(event) => {
        if (event.buttons === 1) {
          setAzimuth(azimuth - event.movementX);
          setElevation(elevation + event.movementY);
        } else if (event.buttons === 2) {
          setPanTo(Vec2.fromValues(panTo.x + event.movementX, panTo.y + event.movementY));
        }
      }}
      width={width}
      height={height}
      viewBox={`-${width / 2 + panTo.x} -${height / 2 + panTo.y} ${width} ${height}`}
    >
      {computedMesh.map(([face, voxel, faceIndex, voxelIndex]) => (
        <polygon
          onClick={() => {
            if (voxels.length >= MAX_VOXELS) {
              return;
            }
            switch (sceneMode) {
              case SceneMode.Draw: {
                onAddVoxel && onAddVoxel(calculateNextVoxelPosition(voxel.position, faceIndex));
                break;
              }
              case SceneMode.Delete: {
                onDeleteVoxel && onDeleteVoxel(voxel.position);
                break;
              }
            }
          }}
          key={`${faceIndex}:${voxelIndex}`}
          stroke={Color(voxel.color).darken(0.2).hex()}
          strokeOpacity={1}
          fill={voxel.color}
          points={renderPolygonPoints(face)}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
