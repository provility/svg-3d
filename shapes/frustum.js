// Frustum: truncated cone or pyramid with configurable top and bottom radii
export function createFrustum(segments = 16, topRadius = 0.5, bottomRadius = 1, showRulings = true, showFill = false) {
  const vertices = [];
  const edges = [];
  const faces = [];
  const capFaces = [];

  // Top circle vertices
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    vertices.push([Math.cos(angle) * topRadius, -1, Math.sin(angle) * topRadius]);
  }

  // Bottom circle vertices
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    vertices.push([Math.cos(angle) * bottomRadius, 1, Math.sin(angle) * bottomRadius]);
  }

  for (let i = 0; i < segments; i++) {
    const topCurr = i;
    const topNext = (i + 1) % segments;
    const botCurr = segments + i;
    const botNext = segments + (i + 1) % segments;

    // Top circle edge
    edges.push([topCurr, topNext]);
    // Bottom circle edge
    edges.push([botCurr, botNext]);

    // Vertical/slanted edges
    if (showRulings) {
      edges.push([topCurr, botCurr]);
    }

    // Side faces
    if (showFill) {
      faces.push([topCurr, topNext, botNext, botCurr]);
    }
  }

  // Top and bottom cap faces
  if (showFill) {
    const topCap = [];
    const botCap = [];
    for (let i = 0; i < segments; i++) {
      topCap.push(i);
      botCap.push(segments + i);
    }
    capFaces.push(topCap);
    capFaces.push(botCap);
  }

  return { vertices, edges, faces, capFaces };
}
