// Prism: n-sided polygon extruded along height
export function createPrism(sides = 6, showRulings = true, showFill = false) {
  const vertices = [];
  const edges = [];
  const faces = [];
  const capFaces = [];

  // Top and bottom polygon vertices
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    vertices.push([Math.cos(angle), -1, Math.sin(angle)]); // top
    vertices.push([Math.cos(angle), 1, Math.sin(angle)]);  // bottom
  }

  for (let i = 0; i < sides; i++) {
    const topCurr = i * 2;
    const botCurr = i * 2 + 1;
    const topNext = ((i + 1) % sides) * 2;
    const botNext = ((i + 1) % sides) * 2 + 1;

    // Top and bottom edges
    edges.push([topCurr, topNext]);
    edges.push([botCurr, botNext]);

    // Vertical edges
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
    for (let i = 0; i < sides; i++) {
      topCap.push(i * 2);
      botCap.push(i * 2 + 1);
    }
    capFaces.push(topCap);
    capFaces.push(botCap);
  }

  return { vertices, edges, faces, capFaces };
}
