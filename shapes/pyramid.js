// Pyramid: n-sided base with apex
export function createPyramid(sides = 4, showRulings = true, showFill = false) {
  const vertices = [];
  const edges = [];
  const faces = [];
  const capFaces = [];

  // Apex at top
  vertices.push([0, -1, 0]);

  // Base vertices
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    vertices.push([Math.cos(angle), 1, Math.sin(angle)]);
  }

  for (let i = 0; i < sides; i++) {
    const curr = i + 1;
    const next = (i + 1) % sides + 1;

    // Edge from apex to base
    if (showRulings) {
      edges.push([0, curr]);
    }

    // Base edge
    edges.push([curr, next]);

    // Side face
    if (showFill) {
      faces.push([0, curr, next]);
    }
  }

  // Base cap face
  if (showFill) {
    const baseCap = [];
    for (let i = 1; i <= sides; i++) {
      baseCap.push(i);
    }
    capFaces.push(baseCap);
  }

  return { vertices, edges, faces, capFaces };
}
