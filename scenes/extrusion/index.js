import animate from '../animate.js';
import hover from '../hover.js';
import { createExtrusion, arc, joinSegments } from '../../shapes/extrusion.js';

export const name = 'Extrusion';

// Convert shape output to scene format
function shapeToScene(shape, offsetX = 0, offsetY = 0, offsetZ = 0, scale = 1) {
  const shapes = [];

  // Add edges
  for (const [i, j] of shape.edges) {
    const from = shape.vertices[i];
    const to = shape.vertices[j];
    shapes.push({
      type: 'edge',
      from: [from[0] * scale + offsetX, from[1] * scale + offsetY, from[2] * scale + offsetZ],
      to: [to[0] * scale + offsetX, to[1] * scale + offsetY, to[2] * scale + offsetZ]
    });
  }

  return shapes;
}

export default async function () {
  // L-shaped prism (like image 15)
  const lProfile = [[0,0], [1.2,0], [1.2,0.4], [0.4,0.4], [0.4,1.6], [0,1.6]];
  const lShape = createExtrusion(lProfile, { direction: [0,0,1], length: 2 });

  // Triangle prism (like image d/18)
  const triProfile = [[0,0], [1,0], [0,0.6]];
  const triShape = createExtrusion(triProfile, { direction: [0,0,1], length: 1.4 });

  // Half-cylinder (like image f)
  const halfCircle = joinSegments(
    arc([0, 0], 0.6, 0, Math.PI, 12),
    [[-0.6, 0]]
  );
  const halfCylShape = createExtrusion(halfCircle, { direction: [0,0,1], length: 2 });

  // T-shaped prism (like image 16)
  const tProfile = [[-0.2,0], [0.2,0], [0.2,0.8], [0.6,0.8], [0.6,1.2], [-0.6,1.2], [-0.6,0.8], [-0.2,0.8]];
  const tShape = createExtrusion(tProfile, { direction: [0,0,1], length: 1 });

  const shapes = [
    ...shapeToScene(lShape, -2, 0, 0),
    ...shapeToScene(triShape, 0, 0.5, 0),
    ...shapeToScene(halfCylShape, 2, 0.3, 0),
    ...shapeToScene(tShape, 0, -1.5, 0),
  ];

  return animate(640, 480, [shapes], hover());
}
