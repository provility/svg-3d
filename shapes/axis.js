// 3D Axis with ticks: a line segment with tick marks at regular intervals
// Can be used to build dimension markers, rulers, or coordinate axes

export function createAxis(start, end, options = {}) {
  const {
    ticks = 5,              // Number of tick marks (including start and end)
    tickLength = 0.1,       // Length of each tick mark
    tickDirection = null,   // Direction ticks point (auto-calculated if null)
    showEndTicks = true,    // Show ticks at start and end points
    labels = null,          // Array of labels for each tick, or null for no labels
  } = options;

  const vertices = [];
  const edges = [];
  const tickPositions = [];  // 3D positions of each tick (for label placement)

  // Direction from start to end
  const dir = [
    end[0] - start[0],
    end[1] - start[1],
    end[2] - start[2],
  ];

  // Length of the axis
  const length = Math.sqrt(dir[0] ** 2 + dir[1] ** 2 + dir[2] ** 2);

  // Normalized direction
  const dirNorm = [dir[0] / length, dir[1] / length, dir[2] / length];

  // Calculate perpendicular direction for ticks
  let tickDir;
  if (tickDirection) {
    tickDir = normalize(tickDirection);
  } else {
    // Auto-calculate: find a perpendicular vector
    let ref = [0, 1, 0];
    if (Math.abs(dot(dirNorm, ref)) > 0.9) {
      ref = [1, 0, 0];
    }
    tickDir = normalize(cross(dirNorm, ref));
  }

  // Main axis line
  vertices.push(start); // 0
  vertices.push(end);   // 1
  edges.push([0, 1]);

  // Create ticks
  const tickCount = Math.max(2, ticks);
  for (let i = 0; i < tickCount; i++) {
    // Skip first and last if showEndTicks is false
    if (!showEndTicks && (i === 0 || i === tickCount - 1)) {
      // Still record position for labels
      const t = i / (tickCount - 1);
      const pos = [
        start[0] + dir[0] * t,
        start[1] + dir[1] * t,
        start[2] + dir[2] * t,
      ];
      tickPositions.push(pos);
      continue;
    }

    const t = i / (tickCount - 1);
    const pos = [
      start[0] + dir[0] * t,
      start[1] + dir[1] * t,
      start[2] + dir[2] * t,
    ];

    tickPositions.push(pos);

    // Tick endpoints (perpendicular to axis)
    const tickStart = [
      pos[0] - tickDir[0] * tickLength / 2,
      pos[1] - tickDir[1] * tickLength / 2,
      pos[2] - tickDir[2] * tickLength / 2,
    ];
    const tickEnd = [
      pos[0] + tickDir[0] * tickLength / 2,
      pos[1] + tickDir[1] * tickLength / 2,
      pos[2] + tickDir[2] * tickLength / 2,
    ];

    const idx = vertices.length;
    vertices.push(tickStart);
    vertices.push(tickEnd);
    edges.push([idx, idx + 1]);
  }

  // Label positions (offset from tick positions)
  const labelPositions = tickPositions.map(pos => [
    pos[0] + tickDir[0] * tickLength,
    pos[1] + tickDir[1] * tickLength,
    pos[2] + tickDir[2] * tickLength,
  ]);

  return {
    vertices,
    edges,
    tickPositions,      // 3D positions of ticks (on the axis line)
    labelPositions,     // 3D positions for labels (offset from ticks)
    labels: labels || [], // Label text array
    length,             // Total axis length
    direction: dirNorm, // Normalized axis direction
    tickDirection: tickDir, // Direction ticks point
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
