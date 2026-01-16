export function createCylinder(segments = 16, showRulings = true, showFill = false) {
  const vertices = [];
  const edges = [];
  const faces = [];
  const capFaces = [];

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    vertices.push([Math.cos(angle), -1, Math.sin(angle)]);
    vertices.push([Math.cos(angle), 1, Math.sin(angle)]);
  }

  for (let i = 0; i < segments; i++) {
    const topCurr = i * 2;
    const botCurr = i * 2 + 1;
    const topNext = ((i + 1) % segments) * 2;
    const botNext = ((i + 1) % segments) * 2 + 1;

    edges.push([topCurr, topNext]);
    edges.push([botCurr, botNext]);
    if (showRulings) {
      edges.push([topCurr, botCurr]);
    }
    if (showFill) {
      faces.push([topCurr, topNext, botNext, botCurr]);
    }
  }

  // Top and bottom cap faces
  if (showFill) {
    const topCap = [];
    const botCap = [];
    for (let i = 0; i < segments; i++) {
      topCap.push(i * 2);
      botCap.push(i * 2 + 1);
    }
    capFaces.push(topCap);
    capFaces.push(botCap);
  }

  return { vertices, edges, faces, capFaces };
}
