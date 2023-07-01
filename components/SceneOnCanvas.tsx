"use client";
import Color from "color";
import { Point2D, Point3D, SceneMode, Voxel } from "@/types/Voxel";
import { enumerateIterable } from "@/utils/enumerate-iterable";
import { Mat4, Vec2, Vec3 } from "gl-matrix/dist/esm";
import { PointerEventHandler, useEffect, useMemo, useRef, useState } from "react";
import makePolygon from "@/utils/make-polygon";
import reverseArray from "@/utils/reverse-array";

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
  [0, 1, 2, 3],
  [1, 5, 6, 2],
  [0, 4, 7, 3],
  [0, 4, 5, 1],
  [4, 5, 6, 7],
  [3, 7, 6, 2],
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

function clamp(number: number, min: number, max: number) {
  return Math.max(min, Math.min(max, number));
}

function pointOnTarget(element: HTMLElement, x: number, y: number): Point2D {
  const canvasClientRect = element.getBoundingClientRect();
  return { x: x - canvasClientRect.x, y: y - canvasClientRect.y };
}

export default function SceneOnCanvas({
  voxels,
  sceneMode,
  width,
  height,
  onAddVoxel,
  onDeleteVoxel,
  scale: scaleInitial = 20,
  onScaleChange,
}: {
  voxels: Voxel[];
  sceneMode: SceneMode;
  width: number;
  height: number;
  onAddVoxel?: (position: Point3D) => void;
  onDeleteVoxel?: (position: Point3D) => void;
  scale?: number;
  onScaleChange?: (scale: number) => void;
}) {
  const [azimuth, setAzimuth] = useState(110);
  const [elevation, setElevation] = useState(220);
  const [panTo, setPanTo] = useState<Point2D>({ x: width/2, y: height/2 });
  const [scale, setScale] = useState(scaleInitial);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    setPanTo({ x: width / 2, y: height / 2 });
  }, [width, height]);
  useEffect(() => {
    const element = canvasRef.current!;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey) {
        const pointer = pointOnTarget(element, event.clientX, event.clientY);
        const pinchMultipier = 0.5;
        const scaleDelta =
          Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX * pinchMultipier
            : event.deltaY * pinchMultipier;
        const newScale = clamp(scale - scaleDelta, 4, 200);
        setScale(newScale);
        setPanTo({
          x: (pointer.x / newScale - (pointer.x / scale - panTo.x / scale)) * newScale,
          y: (pointer.y / newScale - (pointer.y / scale - panTo.y / scale)) * newScale,
        });
        onScaleChange && onScaleChange(newScale);
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
  }, [scale, panTo, onScaleChange]);
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
  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    context.clearRect(0, 0, width * 2, height * 2);
    for (const [points, voxel] of computedMesh) {
      const path = new Path2D();
      for (const [moveTo, point] of makePolygon(points)) {
        const screenCoordinates = {
          x: (panTo.x + point.x) * 2,
          y: (panTo.y + point.y) * 2,
        };
        if (moveTo) {
          path.moveTo(screenCoordinates.x, screenCoordinates.y);
        } else {
          path.lineTo(screenCoordinates.x, screenCoordinates.y);
        }
      }
      context.fillStyle = voxel.color;
      context.strokeStyle = Color(voxel.color).darken(0.2).hex();
      context.lineWidth = 2;
      context.lineJoin = "round";
      context.fill(path);
      context.stroke(path);
    }
  }, [voxels, computedMesh, width, height, panTo, scale]);
  const onClickCanvas: PointerEventHandler<HTMLCanvasElement> = (event) => {
    let clickedVoxelPosition;
    let clickedFaceIndex;
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const pointOnCanvas = pointOnTarget(canvas, event.clientX, event.clientY);
    for (const [points, voxel, faceIndex] of reverseArray(computedMesh)) {
      const path = new Path2D();
      for (const [moveTo, point] of makePolygon(points)) {
        const screenCoordinates = {
          x: panTo.x + point.x,
          y: panTo.y + point.y,
        };
        if (moveTo) {
          path.moveTo(screenCoordinates.x, screenCoordinates.y);
        } else {
          path.lineTo(screenCoordinates.x, screenCoordinates.y);
        }
      }
      if (context.isPointInPath(path, pointOnCanvas.x, pointOnCanvas.y)) {
        clickedVoxelPosition = voxel.position;
        clickedFaceIndex = faceIndex;
        break;
      }
    }
    if (clickedVoxelPosition && clickedFaceIndex !== undefined) {
      if (sceneMode === SceneMode.Draw) {
        onAddVoxel && onAddVoxel(calculateNextVoxelPosition(clickedVoxelPosition, clickedFaceIndex));
      } else if (sceneMode === SceneMode.Delete) {
        onDeleteVoxel && onDeleteVoxel(clickedVoxelPosition);
      }
    }
  };
  return (
    <canvas
      ref={canvasRef}
      touch-action="none"
      onContextMenu={(event) => {
        event.preventDefault();
      }}
      onPointerMove={(event) => {
        if (event.buttons === 1) {
          setAzimuth(azimuth - event.movementX);
          setElevation(elevation + event.movementY);
        } else if (event.buttons === 2) {
          setPanTo(Vec2.fromValues(panTo.x + event.movementX, panTo.y + event.movementY));
        }
      }}
      onClick={sceneMode === SceneMode.View || (!onAddVoxel && !onDeleteVoxel) ? undefined : onClickCanvas}
      style={{ width, height }}
      width={width * 2}
      height={height * 2}
    />
  );
}
