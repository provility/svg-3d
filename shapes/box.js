// Box: rectangular prism with configurable width, height, and depth
export function createBox(width = 1, height = 1, depth = 1) {
  const w = width / 2;
  const h = height / 2;
  const d = depth / 2;

  const vertices = [
    [-w, -h, -d], [w, -h, -d], [w, h, -d], [-w, h, -d],  // back face
    [-w, -h, d], [w, -h, d], [w, h, d], [-w, h, d],      // front face
  ];

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],  // back face
    [4, 5], [5, 6], [6, 7], [7, 4],  // front face
    [0, 4], [1, 5], [2, 6], [3, 7],  // connecting edges
  ];

  return { vertices, edges };
}
