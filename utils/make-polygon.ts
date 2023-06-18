import { Vec3 } from "gl-matrix";

export default function *makePolygon(points: Vec3[]): Iterable<[moveTo: boolean, coordinates: Vec3]> {
  let i = 0;
  let startPoint;
  for (const point of points) {
    if (i++ === 0) {
      startPoint = point;
      yield [true, point]
    } else {
      yield [false, point]
    }
  }
  yield [false, startPoint!]
}
