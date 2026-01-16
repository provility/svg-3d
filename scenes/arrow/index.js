import animate from '../animate.js';
import hover from '../hover.js';

export const name = 'Arrow';

// Creates a 3D arrow pointing in a direction
function arrow(from, to, headSize = 0.3) {
  const shapes = [];

  // Direction vector
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Normalized direction
  const nx = dx / length;
  const ny = dy / length;
  const nz = dz / length;

  // Arrow shaft
  shapes.push({ type: 'edge', from, to });

  // Find perpendicular vectors for arrowhead
  // Pick a vector not parallel to direction
  let px, py, pz;
  if (Math.abs(nx) < 0.9) {
    px = 1; py = 0; pz = 0;
  } else {
    px = 0; py = 1; pz = 0;
  }

  // Cross product: perp1 = direction x p
  const p1x = ny * pz - nz * py;
  const p1y = nz * px - nx * pz;
  const p1z = nx * py - ny * px;
  const p1Len = Math.sqrt(p1x * p1x + p1y * p1y + p1z * p1z);
  const perp1 = [p1x / p1Len * headSize, p1y / p1Len * headSize, p1z / p1Len * headSize];

  // Cross product: perp2 = direction x perp1
  const p2x = ny * perp1[2] - nz * perp1[1];
  const p2y = nz * perp1[0] - nx * perp1[2];
  const p2z = nx * perp1[1] - ny * perp1[0];
  const perp2 = [p2x, p2y, p2z];

  // Arrowhead base point (slightly back from tip)
  const basePoint = [
    to[0] - nx * headSize * 1.5,
    to[1] - ny * headSize * 1.5,
    to[2] - nz * headSize * 1.5,
  ];

  // 4 arrowhead edges forming a pyramid
  const headPoints = [
    [basePoint[0] + perp1[0], basePoint[1] + perp1[1], basePoint[2] + perp1[2]],
    [basePoint[0] - perp1[0], basePoint[1] - perp1[1], basePoint[2] - perp1[2]],
    [basePoint[0] + perp2[0], basePoint[1] + perp2[1], basePoint[2] + perp2[2]],
    [basePoint[0] - perp2[0], basePoint[1] - perp2[1], basePoint[2] - perp2[2]],
  ];

  // Edges from head points to tip
  for (const p of headPoints) {
    shapes.push({ type: 'edge', from: p, to });
  }

  // Connect head points to form base
  shapes.push({ type: 'edge', from: headPoints[0], to: headPoints[2] });
  shapes.push({ type: 'edge', from: headPoints[2], to: headPoints[1] });
  shapes.push({ type: 'edge', from: headPoints[1], to: headPoints[3] });
  shapes.push({ type: 'edge', from: headPoints[3], to: headPoints[0] });

  return shapes;
}

export default async function () {
  // Create 3 coordinate axis arrows (X, Y, Z)
  const origin = [0, 0, 0];

  const shapes = [
    ...arrow(origin, [1.5, 0, 0], 0.2),  // X axis
    ...arrow(origin, [0, -1.5, 0], 0.2), // Y axis (up)
    ...arrow(origin, [0, 0, 1.5], 0.2),  // Z axis
  ];

  return animate(640, 480, [shapes], hover());
}
