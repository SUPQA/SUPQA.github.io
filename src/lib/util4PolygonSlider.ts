import * as d3 from 'd3';

export function getVertices(n, r, cx, cy, rotationDegrees = 0) {
  const rotationRadians = (rotationDegrees * Math.PI) / 180; // Convert degrees to radians
  const points = [];
  for (let i = 0; i <= n; i++) {
    const angle = ((2 * Math.PI) / n) * i + rotationRadians;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    points.push([x, y]);
  }
  return points;
}

export function getSubPolygon(handlePos, points) {
  let totalArea = 0;
  let subPolygon = [];
  for (let i = 0; i < points.length - 1; i++) {
    const nextIndex = (i + 1) % points.length;
    const vertices = [handlePos, points[i], points[nextIndex]];

    const area = Math.abs(d3.polygonArea(vertices));
    const centroid = d3.polygonCentroid(vertices);
    totalArea += area;
    subPolygon.push({
      vertices,
      centroid,
      area,
    });
  }

  subPolygon = subPolygon.map((item) => ({
    ...item,
    percent: +((item.area / totalArea) * 100).toFixed(0),
  }));
  return subPolygon;
}

export function isPointInsidePolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];
    const intersect =
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function findClosestPointOnPolygonEdges(point, polygon) {
  let minDistance = Infinity;
  let closestPoint = null;

  for (let i = 0; i < polygon.length; i++) {
    const nextIndex = (i + 1) % polygon.length;
    const edgeStart = polygon[i];
    const edgeEnd = polygon[nextIndex];

    const projection = projectPointToLine(point, edgeStart, edgeEnd);
    if (projection && isBetween(edgeStart, edgeEnd, projection)) {
      const distance = Math.hypot(
        projection[0] - point[0],
        projection[1] - point[1]
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = projection;
      }
    }
  }

  return closestPoint || point;
}

export function projectPointToLine(point, lineStart, lineEnd) {
  const dx = lineEnd[0] - lineStart[0];
  const dy = lineEnd[1] - lineStart[1];
  const t =
    ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) /
    (dx * dx + dy * dy);

  if (t >= 0 && t <= 1) {
    return [lineStart[0] + t * dx, lineStart[1] + t * dy];
  }

  return null;
}

export function isBetween(start, end, point) {
  return (
    (start[0] <= point[0] && point[0] <= end[0]) ||
    (end[0] <= point[0] &&
      point[0] <= start[0] &&
      start[1] <= point[1] &&
      point[1] <= end[1]) ||
    (end[1] <= point[1] && point[1] <= start[1])
  );
}

export const MOCK = [
  [0.4, 0.5],
  [0.2, 0.9],
];

export function getLegendXY(handlePos, centroid, dis) {
  const dx = centroid[0] - handlePos[0];
  const dy = centroid[1] - handlePos[1];
  const lengthCP = Math.sqrt(dx * dx + dy * dy);

  const m = -dx / dy;
  const angle = Math.atan(m) * (180 / Math.PI);

  // 0 不做除数
  if (lengthCP === 0) {
    throw new Error('The point P is at the center of the circle.');
  }
  const xp = handlePos[0] + (dx / lengthCP) * dis;
  const yp = handlePos[1] + (dy / lengthCP) * dis;
  return [xp, yp, angle];
}
