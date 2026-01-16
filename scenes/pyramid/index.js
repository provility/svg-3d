import animate from '../animate.js';
import hover from '../hover.js';

export const name = 'Pyramid';

export default async function () {
  const apex = [0, -1, 0];
  const base = [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]];

  const shapes = [
    { type: 'face', points: base }, // base
    // 4 triangular faces
    { type: 'face', points: [base[0], base[1], apex] },
    { type: 'face', points: [base[1], base[2], apex] },
    { type: 'face', points: [base[2], base[3], apex] },
    { type: 'face', points: [base[3], base[0], apex] },
  ];

  return animate(640, 480, [shapes], hover());
}
