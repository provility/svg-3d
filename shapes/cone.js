export function createCone(segments = 16, showRulings = true, showFill = false) {
  const vertices = [];
  const edges = [];
  const faces = [];
  const capFaces = [];

  vertices.push([0, -1, 0]);

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    vertices.push([Math.cos(angle), 1, Math.sin(angle)]);
  }

  for (let i = 0; i < segments; i++) {
    const curr = i + 1;
    const next = (i + 1) % segments + 1;
    if (showRulings) {
      edges.push([0, curr]);
    }
    edges.push([curr, next]);
    if (showFill) {
      faces.push([0, curr, next]);
    }
  }

  // Bottom cap face
  if (showFill) {
    const botCap = [];
    for (let i = 1; i <= segments; i++) {
      botCap.push(i);
    }
    capFaces.push(botCap);
  }

  return { vertices, edges, faces, capFaces };
}
