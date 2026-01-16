// Coordinate system definitions and transformations

export const COORDINATE_SYSTEMS = {
  RHS: {
    name: 'Right-Hand System (Y-up)',
    up: [0, 1, 0],       // Y is up
    forward: [0, 0, -1], // -Z is forward (towards viewer)
    right: [1, 0, 0],    // X is right
    handedness: 'right',
  },
  LHS: {
    name: 'Left-Hand System (Z-up)',
    up: [0, 0, 1],       // Z is up
    forward: [1, 0, 0],  // X is forward (towards viewer)
    right: [0, 1, 0],    // Y is right
    handedness: 'left',
  },
};

// Transform a point from RHS (Y-up, default) to the target coordinate system
export function transformToSystem(point, system) {
  if (system === 'RHS') {
    return point; // No transform needed
  }

  // LHS: swap Y and Z so shapes stand upright along Z
  const [x, y, z] = point;
  return [x, z, y];
}

// Transform a point from the target system back to RHS
export function transformFromSystem(point, system) {
  if (system === 'RHS') {
    return point;
  }

  // LHS: swap back Y and Z
  const [x, y, z] = point;
  return [x, z, y];
}

// Get the up vector for a coordinate system
export function getUpVector(system) {
  return COORDINATE_SYSTEMS[system].up;
}

// Get the forward vector for a coordinate system
export function getForwardVector(system) {
  return COORDINATE_SYSTEMS[system].forward;
}

// Get the right vector for a coordinate system
export function getRightVector(system) {
  return COORDINATE_SYSTEMS[system].right;
}

// Get axis configuration for a coordinate system
export function getAxisConfig(system) {
  const config = COORDINATE_SYSTEMS[system];

  if (system === 'LHS') {
    return {
      axes: [
        { direction: [1, 0, 0], color: '#cc0000', label: 'X', description: 'forward' },
        { direction: [0, 1, 0], color: '#00aa00', label: 'Y', description: 'right' },
        { direction: [0, 0, 1], color: '#0066cc', label: 'Z', description: 'up' },
      ],
    };
  } else {
    return {
      axes: [
        { direction: [1, 0, 0], color: '#cc0000', label: 'X', description: 'right' },
        { direction: [0, 1, 0], color: '#00aa00', label: 'Y', description: 'up' },
        { direction: [0, 0, 1], color: '#0066cc', label: 'Z', description: 'forward' },
      ],
    };
  }
}
