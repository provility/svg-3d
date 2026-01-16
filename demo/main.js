import { createCube } from '../shapes/cube.js';
import { createBox } from '../shapes/box.js';
import { createCylinder } from '../shapes/cylinder.js';
import { createCone } from '../shapes/cone.js';
import { createPrism } from '../shapes/prism.js';
import { createPyramid } from '../shapes/pyramid.js';
import { createFrustum } from '../shapes/frustum.js';
import { createExtrusion, arc, joinSegments } from '../shapes/extrusion.js';
import { createDimensionMarker } from '../shapes/dimension.js';
import { createCoordinateAxes } from './axes.js';

// Import core modules
import { rotateX, rotateY, rotateZ } from '../core/transform.js';
import { transformToSystem } from '../core/coordinateSystem.js';
import { Projector, PROJECTION_TYPES } from '../core/projection.js';

const width = 400;
const height = 400;

// Create projector instance
const projector = new Projector({ width, height });

// Current coordinate system
let coordinateSystem = 'RHS';

// DOM elements
const container = document.getElementById('container');
const select = document.getElementById('shapeSelect');
const rotateXSlider = document.getElementById('rotateX');
const rotateYSlider = document.getElementById('rotateY');
const rotateZSlider = document.getElementById('rotateZ');
const rotateXVal = document.getElementById('rotateXVal');
const rotateYVal = document.getElementById('rotateYVal');
const rotateZVal = document.getElementById('rotateZVal');
const viewXSlider = document.getElementById('viewX');
const viewYSlider = document.getElementById('viewY');
const viewZSlider = document.getElementById('viewZ');
const viewXVal = document.getElementById('viewXVal');
const viewYVal = document.getElementById('viewYVal');
const viewZVal = document.getElementById('viewZVal');
const segmentsSlider = document.getElementById('segments');
const segmentsVal = document.getElementById('segmentsVal');
const segmentsGroup = document.getElementById('segmentsGroup');
const topRadiusSlider = document.getElementById('topRadius');
const topRadiusVal = document.getElementById('topRadiusVal');
const topRadiusGroup = document.getElementById('topRadiusGroup');
const boxWidthSlider = document.getElementById('boxWidth');
const boxWidthVal = document.getElementById('boxWidthVal');
const boxHeightSlider = document.getElementById('boxHeight');
const boxHeightVal = document.getElementById('boxHeightVal');
const boxDepthSlider = document.getElementById('boxDepth');
const boxDepthVal = document.getElementById('boxDepthVal');
const boxDimsGroup = document.getElementById('boxDimsGroup');
const showRulingsCheckbox = document.getElementById('showRulings');
const rulingsGroup = document.getElementById('rulingsGroup');
const showFillCheckbox = document.getElementById('showFill');
const fillGroup = document.getElementById('fillGroup');
const projectionSelect = document.getElementById('projection');
const showDimensionsCheckbox = document.getElementById('showDimensions');
const showAxesCheckbox = document.getElementById('showAxes');
const coordSystemSelect = document.getElementById('coordSystem');
const profileInput = document.getElementById('profileInput');
const extrusionLengthSlider = document.getElementById('extrusionLength');
const extrusionLengthVal = document.getElementById('extrusionLengthVal');
const extrusionGroup = document.getElementById('extrusionGroup');
const extrusionAxisSelect = document.getElementById('extrusionAxis');
const profilePresetSelect = document.getElementById('profilePreset');
const arcSegmentsSlider = document.getElementById('arcSegments');
const arcSegmentsVal = document.getElementById('arcSegmentsVal');

// Generate profile based on preset
function generateProfile(preset, segments) {
  switch (preset) {
    case 'l-shape':
      return [[0,0], [1,0], [1,0.3], [0.3,0.3], [0.3,1], [0,1]];
    case 't-shape':
      return [[-0.15,0], [0.15,0], [0.15,0.5], [0.5,0.5], [0.5,0.8], [-0.5,0.8], [-0.5,0.5], [-0.15,0.5]];
    case 'triangle':
      return [[0,0], [1,0], [0.5,0.8]];
    case 'semicircle':
      return joinSegments(arc([0, 0], 0.5, 0, Math.PI, segments), [[-0.5, 0]]);
    case 'arc-90':
      return joinSegments(arc([0, 0], 0.5, 0, Math.PI / 2, segments), [[0, 0]]);
    case 'arc-270':
      return joinSegments(arc([0, 0], 0.5, 0, Math.PI * 1.5, segments), [[0, 0]]);
    case 'rounded-rect': {
      const r = 0.15;
      const w = 0.8, h = 0.5;
      return joinSegments(
        arc([w-r, r], r, -Math.PI/2, 0, segments/4),
        arc([w-r, h-r], r, 0, Math.PI/2, segments/4),
        arc([r, h-r], r, Math.PI/2, Math.PI, segments/4),
        arc([r, r], r, Math.PI, Math.PI*1.5, segments/4)
      );
    }
    default:
      return null; // custom - use textarea
  }
}

let svg, lines, polygons, capPolygons, shape;
let dimensionLines = [];
let dimensionLabels = [];
let dimensions = [];
let axisLines = [];
let axisLabels = [];
let axes = [];

function updateControlsVisibility() {
  const shapeType = select.value;
  const showExtra = shapeType === 'cylinder' || shapeType === 'cone' || shapeType === 'prism' || shapeType === 'pyramid' || shapeType === 'frustum';
  const isBox = shapeType === 'box';
  const isExtrusion = shapeType === 'extrusion';

  segmentsGroup.style.display = showExtra ? 'flex' : 'none';
  rulingsGroup.style.display = (showExtra || isExtrusion) ? 'block' : 'none';
  fillGroup.style.display = (showExtra || isExtrusion) ? 'block' : 'none';
  topRadiusGroup.style.display = shapeType === 'frustum' ? 'flex' : 'none';
  boxDimsGroup.style.display = isBox ? 'flex' : 'none';
  extrusionGroup.style.display = isExtrusion ? 'flex' : 'none';

  // Update label and default value based on shape type
  const segmentsLabel = document.getElementById('segmentsLabel');
  if (shapeType === 'prism' || shapeType === 'pyramid') {
    segmentsLabel.textContent = 'Sides:';
    if (parseInt(segmentsSlider.value) > 8) {
      segmentsSlider.value = shapeType === 'pyramid' ? 4 : 6;
    }
  } else {
    segmentsLabel.textContent = 'Segments:';
  }
}

function buildShape() {
  if (svg) svg.remove();
  updateControlsVisibility();

  svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  container.appendChild(svg);

  const shapeType = select.value;
  const segments = parseInt(segmentsSlider.value);
  const showRulings = showRulingsCheckbox.checked;
  const showFill = showFillCheckbox.checked;
  const topRadius = topRadiusSlider.value / 100;
  const boxW = boxWidthSlider.value / 100;
  const boxH = boxHeightSlider.value / 100;
  const boxD = boxDepthSlider.value / 100;
  segmentsVal.textContent = segments;
  topRadiusVal.textContent = topRadius.toFixed(2);
  boxWidthVal.textContent = boxW.toFixed(1);
  boxHeightVal.textContent = boxH.toFixed(1);
  boxDepthVal.textContent = boxD.toFixed(1);

  if (shapeType === 'cube') shape = createCube();
  else if (shapeType === 'box') shape = createBox(boxW, boxH, boxD);
  else if (shapeType === 'cylinder') shape = createCylinder(segments, showRulings, showFill);
  else if (shapeType === 'cone') shape = createCone(segments, showRulings, showFill);
  else if (shapeType === 'prism') shape = createPrism(segments, showRulings, showFill);
  else if (shapeType === 'pyramid') shape = createPyramid(segments, showRulings, showFill);
  else if (shapeType === 'frustum') shape = createFrustum(segments, topRadius, 1, showRulings, showFill);
  else if (shapeType === 'extrusion') {
    const extLen = extrusionLengthSlider.value / 100;
    extrusionLengthVal.textContent = extLen.toFixed(1);
    const arcSegs = parseInt(arcSegmentsSlider.value);
    arcSegmentsVal.textContent = arcSegs;

    const preset = profilePresetSelect.value;
    let profile = generateProfile(preset, arcSegs);

    if (!profile) {
      // custom - parse from textarea
      try {
        profile = JSON.parse(profileInput.value);
      } catch (e) {
        profile = [[0,0], [1,0], [0.5,1]];
      }
    } else {
      // update textarea to show generated points
      profileInput.value = JSON.stringify(profile.map(p => p.map(v => Math.round(v * 1000) / 1000)));
    }

    const axisMap = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
    const direction = axisMap[extrusionAxisSelect.value] || [0, 1, 0];
    shape = createExtrusion(profile, { direction, length: extLen, showRulings, showFill });
  }

  shape.faces = shape.faces || [];
  shape.capFaces = shape.capFaces || [];

  // Side faces (lighter) - render first
  polygons = shape.faces.map(() => {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('fill', '#ddd');
    polygon.setAttribute('stroke', 'none');
    svg.appendChild(polygon);
    return polygon;
  });

  // Cap faces (darker) - render on top
  capPolygons = shape.capFaces.map(() => {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('fill', '#aaa');
    polygon.setAttribute('stroke', 'none');
    svg.appendChild(polygon);
    return polygon;
  });

  lines = shape.edges.map(() => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', 'black');
    line.setAttribute('stroke-width', '2');
    svg.appendChild(line);
    return line;
  });

  // Create dimension markers based on shape type
  dimensions = [];
  dimensionLines = [];
  dimensionLabels = [];

  if (showDimensionsCheckbox.checked) {
    const shapeType = select.value;

    if (shapeType === 'cylinder' || shapeType === 'cone' || shapeType === 'prism' || shapeType === 'pyramid' || shapeType === 'frustum') {
      // Height dimension (along Y axis in RHS, Z axis in LHS)
      dimensions.push(createDimensionMarker(
        [1, -1, 0],  // top right
        [1, 1, 0],   // bottom right
        { offset: 0.3, label: 'h' }
      ));

      // Radius dimension (along X axis at bottom)
      dimensions.push(createDimensionMarker(
        [0, 1, 0],   // center bottom
        [1, 1, 0],   // edge bottom
        { offset: 0.3, capDirection: [0, 0, 1], label: 'r' }
      ));
    } else if (shapeType === 'cube') {
      // Side dimension
      dimensions.push(createDimensionMarker(
        [-1, 1, -1],
        [1, 1, -1],
        { offset: 0.3, label: '2' }
      ));
    } else if (shapeType === 'box') {
      const boxW = boxWidthSlider.value / 100;
      const boxH = boxHeightSlider.value / 100;
      const boxD = boxDepthSlider.value / 100;
      const w = boxW / 2, h = boxH / 2, d = boxD / 2;

      // Width dimension (X)
      dimensions.push(createDimensionMarker(
        [-w, h, -d],
        [w, h, -d],
        { offset: 0.3, label: 'w' }
      ));

      // Height dimension (Y)
      dimensions.push(createDimensionMarker(
        [w, -h, -d],
        [w, h, -d],
        { offset: 0.3, label: 'h' }
      ));

      // Depth dimension (Z)
      dimensions.push(createDimensionMarker(
        [w, h, -d],
        [w, h, d],
        { offset: 0.3, capDirection: [0, 1, 0], label: 'd' }
      ));
    } else if (shapeType === 'extrusion') {
      // Example: dimension using coordinates directly
      // createDimensionMarker(pointA, pointB, { label, offset })
      dimensions.push(createDimensionMarker(
        [0, -1, 0],   // point A
        [0, 1, 0],    // point B
        { offset: 0.3, label: 'L' }
      ));
    }

    // Create SVG elements for dimension markers
    dimensions.forEach(dim => {
      const dimLineGroup = [];
      dim.edges.forEach(() => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('stroke', '#0066cc');
        line.setAttribute('stroke-width', '1.5');
        svg.appendChild(line);
        dimLineGroup.push(line);
      });
      dimensionLines.push({ lines: dimLineGroup, dim });

      // Create label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('fill', '#0066cc');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-family', 'sans-serif');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.textContent = dim.label;
      svg.appendChild(text);
      dimensionLabels.push({ text, dim });
    });
  }

  // Create coordinate axes when dimensions are shown
  axes = [];
  axisLines = [];
  axisLabels = [];

  if (showAxesCheckbox.checked) {
    axes = createCoordinateAxes(coordinateSystem);

    // Create SVG elements for axes
    axes.forEach(({ axis, color }) => {
      const axisLineGroup = [];
      axis.edges.forEach(() => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '1.5');
        svg.appendChild(line);
        axisLineGroup.push(line);
      });
      axisLines.push({ lines: axisLineGroup, axis, color });

      // Create labels for this axis
      const labelGroup = [];
      axis.labels.forEach((labelText, i) => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('fill', color);
        text.setAttribute('font-size', '10');
        text.setAttribute('font-family', 'sans-serif');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.textContent = labelText;
        svg.appendChild(text);
        labelGroup.push({ text, position: axis.labelPositions[i] });
      });
      axisLabels.push(labelGroup);
    });
  }

  render();
}

function render() {
  // Object rotation
  const angleX = (rotateXSlider.value * Math.PI) / 180;
  const angleY = (rotateYSlider.value * Math.PI) / 180;
  const angleZ = (rotateZSlider.value * Math.PI) / 180;

  // View rotation
  const viewAngleX = (viewXSlider.value * Math.PI) / 180;
  const viewAngleY = (viewYSlider.value * Math.PI) / 180;
  const viewAngleZ = (viewZSlider.value * Math.PI) / 180;

  rotateXVal.textContent = rotateXSlider.value + '°';
  rotateYVal.textContent = rotateYSlider.value + '°';
  rotateZVal.textContent = rotateZSlider.value + '°';
  viewXVal.textContent = viewXSlider.value + '°';
  viewYVal.textContent = viewYSlider.value + '°';
  viewZVal.textContent = viewZSlider.value + '°';

  // Update projector settings
  projector.setType(projectionSelect.value === 'perspective' ? PROJECTION_TYPES.PERSPECTIVE : PROJECTION_TYPES.ORTHOGRAPHIC);
  projector.setCoordinateSystem(coordinateSystem);

  // Transform pipeline: Coord System -> Object Rotation -> View Rotation -> Projection
  const rotated = shape.vertices.map(v => {
    // 1. Transform to current coordinate system
    let p = transformToSystem(v, coordinateSystem);
    // 2. Object rotation
    p = rotateZ(rotateY(rotateX(p, angleX), angleY), angleZ);
    // 3. View rotation
    p = rotateZ(rotateY(rotateX(p, viewAngleX), viewAngleY), viewAngleZ);
    return p;
  });

  const projected = rotated.map(p => projector.project(p));

  shape.capFaces.forEach((face, idx) => {
    const points = face.map(i => projected[i].join(',')).join(' ');
    capPolygons[idx].setAttribute('points', points);
  });

  shape.faces.forEach((face, idx) => {
    const points = face.map(i => projected[i].join(',')).join(' ');
    polygons[idx].setAttribute('points', points);
  });

  shape.edges.forEach(([i, j], idx) => {
    const [x1, y1] = projected[i];
    const [x2, y2] = projected[j];
    lines[idx].setAttribute('x1', x1);
    lines[idx].setAttribute('y1', y1);
    lines[idx].setAttribute('x2', x2);
    lines[idx].setAttribute('y2', y2);
  });

  // Render dimension markers (rotate with object and view)
  dimensionLines.forEach(({ lines: dimLines, dim }) => {
    const rotatedVerts = dim.vertices.map(v => {
      let p = transformToSystem(v, coordinateSystem);
      p = rotateZ(rotateY(rotateX(p, angleX), angleY), angleZ);
      p = rotateZ(rotateY(rotateX(p, viewAngleX), viewAngleY), viewAngleZ);
      return p;
    });
    const projectedVerts = rotatedVerts.map(p => projector.project(p));

    dim.edges.forEach(([i, j], idx) => {
      const [x1, y1] = projectedVerts[i];
      const [x2, y2] = projectedVerts[j];
      dimLines[idx].setAttribute('x1', x1);
      dimLines[idx].setAttribute('y1', y1);
      dimLines[idx].setAttribute('x2', x2);
      dimLines[idx].setAttribute('y2', y2);
    });
  });

  // Render dimension labels (rotate with object and view)
  dimensionLabels.forEach(({ text, dim }) => {
    let p = transformToSystem(dim.midpoint, coordinateSystem);
    p = rotateZ(rotateY(rotateX(p, angleX), angleY), angleZ);
    p = rotateZ(rotateY(rotateX(p, viewAngleX), viewAngleY), viewAngleZ);
    const [x, y] = projector.project(p);
    text.setAttribute('x', x);
    text.setAttribute('y', y);
  });

  // Render axes (rotate with view only, not object)
  axisLines.forEach(({ lines: axLines, axis }) => {
    const rotatedVerts = axis.vertices.map(v =>
      rotateZ(rotateY(rotateX(v, viewAngleX), viewAngleY), viewAngleZ)
    );
    const projectedVerts = rotatedVerts.map(p => projector.project(p));

    axis.edges.forEach(([i, j], idx) => {
      const [x1, y1] = projectedVerts[i];
      const [x2, y2] = projectedVerts[j];
      axLines[idx].setAttribute('x1', x1);
      axLines[idx].setAttribute('y1', y1);
      axLines[idx].setAttribute('x2', x2);
      axLines[idx].setAttribute('y2', y2);
    });
  });

  // Render axis labels (rotate with view only)
  axisLabels.forEach(labelGroup => {
    labelGroup.forEach(({ text, position }) => {
      const rotatedPos = rotateZ(rotateY(rotateX(position, viewAngleX), viewAngleY), viewAngleZ);
      const [x, y] = projector.project(rotatedPos);
      text.setAttribute('x', x);
      text.setAttribute('y', y);
    });
  });
}

// Event listeners
select.addEventListener('change', buildShape);
rotateXSlider.addEventListener('input', render);
rotateYSlider.addEventListener('input', render);
rotateZSlider.addEventListener('input', render);
viewXSlider.addEventListener('input', render);
viewYSlider.addEventListener('input', render);
viewZSlider.addEventListener('input', render);
segmentsSlider.addEventListener('input', buildShape);
topRadiusSlider.addEventListener('input', buildShape);
boxWidthSlider.addEventListener('input', buildShape);
boxHeightSlider.addEventListener('input', buildShape);
boxDepthSlider.addEventListener('input', buildShape);
showRulingsCheckbox.addEventListener('change', buildShape);
showFillCheckbox.addEventListener('change', buildShape);
showDimensionsCheckbox.addEventListener('change', buildShape);
showAxesCheckbox.addEventListener('change', buildShape);
projectionSelect.addEventListener('change', render);
profileInput.addEventListener('input', () => {
  profilePresetSelect.value = 'custom';
  buildShape();
});
extrusionLengthSlider.addEventListener('input', buildShape);
extrusionAxisSelect.addEventListener('change', buildShape);
profilePresetSelect.addEventListener('change', buildShape);
arcSegmentsSlider.addEventListener('input', buildShape);

// Coordinate system change handler
if (coordSystemSelect) {
  coordSystemSelect.addEventListener('change', () => {
    coordinateSystem = coordSystemSelect.value;
    buildShape();
  });
}

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    viewXSlider.value = btn.dataset.x;
    viewYSlider.value = btn.dataset.y;
    viewZSlider.value = btn.dataset.z;
    render();
  });
});

// Initialize
buildShape();
