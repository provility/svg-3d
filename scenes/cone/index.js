import animate from '../animate.js';
import hover from '../hover.js';

export const name = 'Cone';

export default async function (segments = 8) {
  const shapes = [];
  const apex = [0, -1, 0];
  const basePoints = [];

  // Generate base circle
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    basePoints.push([Math.cos(angle), 1, Math.sin(angle)]);
  }

  // Base face
  shapes.push({ type: 'face', points: basePoints });

  // Edges from base to apex + base circumference
  for (let i = 0; i < segments; i++) {
    shapes.push({ type: 'edge', from: basePoints[i], to: apex });
    shapes.push({ type: 'edge', from: basePoints[i], to: basePoints[(i + 1) % segments] });
  }

  return animate(640, 480, [shapes], hover());
}
