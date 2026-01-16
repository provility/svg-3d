import animate from '../animate.js';
import hover from '../hover.js';

export const name = 'Plane';

// Creates a 3D plane as a grid
// center: [x, y, z] - center point of the plane
// normal: 'x', 'y', or 'z' - which axis the plane is perpendicular to
// size: width/height of the plane
// divisions: number of grid divisions
function plane(center = [0, 0, 0], normal = 'y', size = 2, divisions = 4) {
  const shapes = [];
  const [cx, cy, cz] = center;
  const half = size / 2;
  const step = size / divisions;

  if (normal === 'y') {
    // Horizontal plane (floor/ceiling)
    // Grid lines along X
    for (let i = 0; i <= divisions; i++) {
      const z = cz - half + i * step;
      shapes.push({ type: 'edge', from: [cx - half, cy, z], to: [cx + half, cy, z] });
    }
    // Grid lines along Z
    for (let i = 0; i <= divisions; i++) {
      const x = cx - half + i * step;
      shapes.push({ type: 'edge', from: [x, cy, cz - half], to: [x, cy, cz + half] });
    }
  } else if (normal === 'x') {
    // Vertical plane facing X
    // Grid lines along Y
    for (let i = 0; i <= divisions; i++) {
      const z = cz - half + i * step;
      shapes.push({ type: 'edge', from: [cx, cy - half, z], to: [cx, cy + half, z] });
    }
    // Grid lines along Z
    for (let i = 0; i <= divisions; i++) {
      const y = cy - half + i * step;
      shapes.push({ type: 'edge', from: [cx, y, cz - half], to: [cx, y, cz + half] });
    }
  } else if (normal === 'z') {
    // Vertical plane facing Z
    // Grid lines along X
    for (let i = 0; i <= divisions; i++) {
      const y = cy - half + i * step;
      shapes.push({ type: 'edge', from: [cx - half, y, cz], to: [cx + half, y, cz] });
    }
    // Grid lines along Y
    for (let i = 0; i <= divisions; i++) {
      const x = cx - half + i * step;
      shapes.push({ type: 'edge', from: [x, cy - half, cz], to: [x, cy + half, cz] });
    }
  }

  return shapes;
}

export default async function () {
  const shapes = [
    // Horizontal ground plane
    ...plane([0, 1, 0], 'y', 2, 4),
  ];

  return animate(640, 480, [shapes], hover());
}
