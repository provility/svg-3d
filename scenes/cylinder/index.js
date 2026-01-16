import animate from '../animate.js';
import hover from '../hover.js';

export const name = 'Cylinder';

export default async function () {
  const shapes = [
    { type: 'face', points: [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1]] },
    { type: 'face', points: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]] },
    { type: 'edge', from: [-1, -1, -1], to: [-1, -1, 1] },
    { type: 'edge', from: [1, -1, -1], to: [1, -1, 1] },
    { type: 'edge', from: [1, 1, -1], to: [1, 1, 1] },
    { type: 'edge', from: [-1, 1, -1], to: [-1, 1, 1] },
  ];

  return animate(640, 480, [shapes], hover());
}
