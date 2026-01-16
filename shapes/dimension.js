// 3D Dimension Marker: shows length between two 3D points
// Classic style: two lines with gap for label, arrows at ends

export function createDimensionMarker(start, end, options = {}) {
  const {
    offset = 0.2,           // How far to offset the dimension line from the points
    arrowSize = 0.08,       // Size of arrow heads
    gapSize = 0.3,          // Gap in middle for label
    capDirection = null,    // Optional: explicit direction for offset (auto-calculated if null)
    label = null,           // Optional: label text (auto-calculated length if null)
  } = options;

  const vertices = [];
  const edges = [];

  // Direction from start to end
  const dir = [
    end[0] - start[0],
    end[1] - start[1],
    end[2] - start[2],
  ];

  // Length of the dimension
  const length = Math.sqrt(dir[0] ** 2 + dir[1] ** 2 + dir[2] ** 2);

  // Normalized direction
  const dirNorm = [dir[0] / length, dir[1] / length, dir[2] / length];

  // Calculate perpendicular direction for offset
  let perpDir;
  if (capDirection) {
    perpDir = normalize(capDirection);
  } else {
    let ref = [0, 1, 0];
    if (Math.abs(dot(dirNorm, ref)) > 0.9) {
      ref = [1, 0, 0];
    }
    perpDir = normalize(cross(dirNorm, ref));
  }

  // Offset the start and end points
  const offsetStart = [
    start[0] + perpDir[0] * offset,
    start[1] + perpDir[1] * offset,
    start[2] + perpDir[2] * offset,
  ];
  const offsetEnd = [
    end[0] + perpDir[0] * offset,
    end[1] + perpDir[1] * offset,
    end[2] + perpDir[2] * offset,
  ];

  // Midpoint
  const midpoint = [
    (offsetStart[0] + offsetEnd[0]) / 2,
    (offsetStart[1] + offsetEnd[1]) / 2,
    (offsetStart[2] + offsetEnd[2]) / 2,
  ];

  // Gap start and end (centered on midpoint)
  const halfGap = gapSize / 2;
  const gapStart = [
    midpoint[0] - dirNorm[0] * halfGap,
    midpoint[1] - dirNorm[1] * halfGap,
    midpoint[2] - dirNorm[2] * halfGap,
  ];
  const gapEnd = [
    midpoint[0] + dirNorm[0] * halfGap,
    midpoint[1] + dirNorm[1] * halfGap,
    midpoint[2] + dirNorm[2] * halfGap,
  ];

  // === LEFT LINE (from start to gap) ===
  vertices.push(offsetStart); // 0
  vertices.push(gapStart);    // 1
  edges.push([0, 1]);

  // === RIGHT LINE (from gap to end) ===
  vertices.push(gapEnd);      // 2
  vertices.push(offsetEnd);   // 3
  edges.push([2, 3]);

  // === ARROW AT START (pointing left/inward) ===
  // Arrow points from start toward end
  const startArrowTip = offsetStart;
  const startArrowBack = [
    offsetStart[0] + dirNorm[0] * arrowSize,
    offsetStart[1] + dirNorm[1] * arrowSize,
    offsetStart[2] + dirNorm[2] * arrowSize,
  ];
  const startArrowLeft = [
    startArrowBack[0] + perpDir[0] * arrowSize * 0.5,
    startArrowBack[1] + perpDir[1] * arrowSize * 0.5,
    startArrowBack[2] + perpDir[2] * arrowSize * 0.5,
  ];
  const startArrowRight = [
    startArrowBack[0] - perpDir[0] * arrowSize * 0.5,
    startArrowBack[1] - perpDir[1] * arrowSize * 0.5,
    startArrowBack[2] - perpDir[2] * arrowSize * 0.5,
  ];
  vertices.push(startArrowLeft);  // 4
  vertices.push(startArrowRight); // 5
  edges.push([0, 4]); // tip to left
  edges.push([0, 5]); // tip to right

  // === ARROW AT END (pointing right/inward) ===
  const endArrowTip = offsetEnd;
  const endArrowBack = [
    offsetEnd[0] - dirNorm[0] * arrowSize,
    offsetEnd[1] - dirNorm[1] * arrowSize,
    offsetEnd[2] - dirNorm[2] * arrowSize,
  ];
  const endArrowLeft = [
    endArrowBack[0] + perpDir[0] * arrowSize * 0.5,
    endArrowBack[1] + perpDir[1] * arrowSize * 0.5,
    endArrowBack[2] + perpDir[2] * arrowSize * 0.5,
  ];
  const endArrowRight = [
    endArrowBack[0] - perpDir[0] * arrowSize * 0.5,
    endArrowBack[1] - perpDir[1] * arrowSize * 0.5,
    endArrowBack[2] - perpDir[2] * arrowSize * 0.5,
  ];
  vertices.push(endArrowLeft);  // 6
  vertices.push(endArrowRight); // 7
  edges.push([3, 6]); // tip to left
  edges.push([3, 7]); // tip to right

  // === EXTENSION LINES (from original points to dimension line) ===
  const extendedStart = [
    start[0] + perpDir[0] * (offset + arrowSize),
    start[1] + perpDir[1] * (offset + arrowSize),
    start[2] + perpDir[2] * (offset + arrowSize),
  ];
  const extendedEnd = [
    end[0] + perpDir[0] * (offset + arrowSize),
    end[1] + perpDir[1] * (offset + arrowSize),
    end[2] + perpDir[2] * (offset + arrowSize),
  ];
  vertices.push(start);         // 8
  vertices.push(extendedStart); // 9
  vertices.push(end);           // 10
  vertices.push(extendedEnd);   // 11
  edges.push([8, 9]);   // start extension line
  edges.push([10, 11]); // end extension line

  // Label text
  const labelText = label !== null ? label : length.toFixed(2);

  return {
    vertices,
    edges,
    midpoint,      // 3D position for label (in the gap)
    label: labelText,
    length,        // Actual measured length
  };
}

// Helper functions
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalize(v) {
  const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
  if (len === 0) return [0, 0, 0];
  return [v[0] / len, v[1] / len, v[2] / len];
}
