// Generic 2D profile extrusion along arbitrary 3D direction
import { normalize, cross, dot } from '../core/transform.js';

// ============ INTERNAL HELPERS ============

/**
 * Calculates signed area to determine winding direction.
 * Positive = CCW, Negative = CW
 */
function signedArea(profile) {
  let area = 0;
  const n = profile.length;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = profile[i];
    const [x2, y2] = profile[(i + 1) % n];
    area += (x2 - x1) * (y2 + y1);
  }
  return area / 2;
}

/**
 * Ensures profile winds counter-clockwise.
 */
function ensureCCW(profile) {
  if (signedArea(profile) > 0) {
    return profile.slice().reverse();
  }
  return profile;
}

/**
 * Builds orthonormal basis from extrusion direction.
 * The profile will be placed perpendicular to this direction.
 */
function buildOrthonormalBasis(direction) {
  // w = normalized direction (extrusion axis)
  const w = normalize(direction);

  // Choose a reference vector not parallel to w
  let ref = [0, 1, 0];
  if (Math.abs(dot(w, ref)) > 0.9) {
    ref = [1, 0, 0];
  }

  // u = ref x w (normalized) - first profile axis
  const u = normalize(cross(ref, w));

  // v = w x u - second profile axis
  const v = cross(w, u);

  return { u, v, w };
}

/**
 * Transforms 2D profile point to 3D using orthonormal basis.
 */
function transformProfilePoint(point2D, basis, offset) {
  const [px, py] = point2D;
  const { u, v, w } = basis;

  return [
    px * u[0] + py * v[0] + offset * w[0],
    px * u[1] + py * v[1] + offset * w[1],
    px * u[2] + py * v[2] + offset * w[2]
  ];
}

/**
 * Check if two 2D points are equal within epsilon.
 */
function pointsEqual(a, b, epsilon = 1e-10) {
  return Math.abs(a[0] - b[0]) < epsilon && Math.abs(a[1] - b[1]) < epsilon;
}

// ============ PROFILE UTILITIES ============

/**
 * Generates points along a circular arc.
 *
 * @param {[number, number]} center - Center point [x, y]
 * @param {number} radius - Radius of arc
 * @param {number} startAngle - Start angle in radians
 * @param {number} endAngle - End angle in radians
 * @param {number} [segments=16] - Number of segments
 * @returns {Array<[number, number]>} Arc points
 */
export function arc(center, radius, startAngle, endAngle, segments = 16) {
  const [cx, cy] = center;
  const points = [];

  const angleDiff = endAngle - startAngle;
  const angleStep = angleDiff / segments;

  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + i * angleStep;
    points.push([
      cx + radius * Math.cos(angle),
      cy + radius * Math.sin(angle)
    ]);
  }

  return points;
}

/**
 * Concatenates multiple profile segments, removing duplicate junction points.
 * Use this to combine arcs with straight segments.
 *
 * @example
 * // Half-cylinder profile: semicircle + flat bottom
 * const profile = joinSegments(
 *   arc([0, 0], 1, 0, Math.PI, 16),
 *   [[-1, 0]]  // close back to start
 * );
 */
export function joinSegments(...segments) {
  if (segments.length === 0) return [];

  const result = [...segments[0]];

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    if (segment.length === 0) continue;

    // Skip first point if it matches last point of result
    const startIdx = (result.length > 0 && pointsEqual(result[result.length - 1], segment[0])) ? 1 : 0;
    for (let j = startIdx; j < segment.length; j++) {
      result.push(segment[j]);
    }
  }

  // Remove last point if it matches first (closed loop)
  if (result.length > 1 && pointsEqual(result[result.length - 1], result[0])) {
    result.pop();
  }

  return result;
}

// ============ MAIN EXTRUSION FUNCTION ============

/**
 * Creates a 3D shape by extruding a 2D profile along a direction vector.
 *
 * @param {Array<[number, number]>} profile - 2D points defining closed polygon
 * @param {Object} options - Extrusion options
 * @param {[number, number, number]} [options.direction=[0, 1, 0]] - Extrusion direction
 * @param {number} [options.length=2] - Extrusion length (centered at origin)
 * @param {boolean} [options.showRulings=true] - Show connecting edges
 * @param {boolean} [options.showFill=false] - Generate face polygons
 * @returns {{ vertices, edges, faces, capFaces }}
 *
 * @example
 * // L-shaped prism
 * const profile = [[0,0], [2,0], [2,0.5], [0.5,0.5], [0.5,1.5], [0,1.5]];
 * const shape = createExtrusion(profile, { direction: [0,0,1], length: 3 });
 *
 * @example
 * // Triangle prism
 * const profile = [[0,0], [1,0], [0.5,1]];
 * const shape = createExtrusion(profile, { direction: [1,0,0], length: 2 });
 *
 * @example
 * // Half-cylinder
 * const profile = joinSegments(arc([0,0], 1, 0, Math.PI, 16), [[-1,0]]);
 * const shape = createExtrusion(profile, { length: 5 });
 */
export function createExtrusion(profile, options = {}) {
  const {
    direction = [0, 1, 0],
    length = 2,
    showRulings = true,
    showFill = false
  } = options;

  // Ensure consistent winding
  const normalizedProfile = ensureCCW(profile);
  const n = normalizedProfile.length;

  // Build transformation basis
  const basis = buildOrthonormalBasis(direction);
  const halfLen = length / 2;

  // Generate vertices
  const vertices = [];

  // Start cap vertices (at -halfLen along direction)
  for (let i = 0; i < n; i++) {
    vertices.push(transformProfilePoint(normalizedProfile[i], basis, -halfLen));
  }

  // End cap vertices (at +halfLen along direction)
  for (let i = 0; i < n; i++) {
    vertices.push(transformProfilePoint(normalizedProfile[i], basis, halfLen));
  }

  // Generate edges
  const edges = [];
  for (let i = 0; i < n; i++) {
    const nextI = (i + 1) % n;

    // Start cap perimeter
    edges.push([i, nextI]);
    // End cap perimeter
    edges.push([n + i, n + nextI]);
    // Rulings
    if (showRulings) {
      edges.push([i, n + i]);
    }
  }

  // Generate faces
  const faces = [];
  const capFaces = [];

  if (showFill) {
    // Side faces (quads connecting caps)
    for (let i = 0; i < n; i++) {
      const nextI = (i + 1) % n;
      faces.push([i, nextI, n + nextI, n + i]);
    }

    // Cap faces
    const startCap = [];
    const endCap = [];
    for (let i = 0; i < n; i++) {
      startCap.push(i);
      endCap.push(n + (n - 1 - i)); // Reversed for correct normal
    }
    capFaces.push(startCap);
    capFaces.push(endCap);
  }

  return { vertices, edges, faces, capFaces };
}
