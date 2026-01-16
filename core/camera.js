// Camera abstraction for 3D viewing

import { normalize, cross, dot, subtract } from './transform.js';
import { COORDINATE_SYSTEMS, getUpVector } from './coordinateSystem.js';

export class Camera {
  constructor(options = {}) {
    this.position = options.position || [0, 0, 5];
    this.target = options.target || [0, 0, 0];
    this.up = options.up || [0, 1, 0];
    this.fov = options.fov || 60;
    this.near = options.near || 0.1;
    this.far = options.far || 100;
    this.coordinateSystem = options.coordinateSystem || 'RHS';
  }

  // Set camera position
  setPosition(x, y, z) {
    this.position = [x, y, z];
  }

  // Set camera target (look-at point)
  setTarget(x, y, z) {
    this.target = [x, y, z];
  }

  // Adapt camera to coordinate system
  setCoordinateSystem(system) {
    this.coordinateSystem = system;
    this.up = getUpVector(system);
  }

  // Set camera from Euler angles (for slider-based control)
  // Positions camera on a sphere around target
  setFromEuler(angleX, angleY, angleZ, distance = 5) {
    // Convert angles to camera position on sphere
    // angleX rotates around horizontal axis (pitch)
    // angleY rotates around vertical axis (yaw)
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    // Position on sphere
    let x = distance * sinY * cosX;
    let y = distance * sinX;
    let z = distance * cosY * cosX;

    // Adjust for coordinate system
    if (this.coordinateSystem === 'LHS') {
      // In LHS, Z is up, so swap y and z for camera positioning
      [y, z] = [z, y];
    }

    this.position = [
      this.target[0] + x,
      this.target[1] + y,
      this.target[2] + z,
    ];
  }

  // Get the view matrix (look-at matrix)
  getViewMatrix() {
    const zAxis = normalize(subtract(this.position, this.target));
    const xAxis = normalize(cross(this.up, zAxis));
    const yAxis = cross(zAxis, xAxis);

    // Build 4x4 view matrix (column-major)
    return [
      xAxis[0], yAxis[0], zAxis[0], 0,
      xAxis[1], yAxis[1], zAxis[1], 0,
      xAxis[2], yAxis[2], zAxis[2], 0,
      -dot(xAxis, this.position),
      -dot(yAxis, this.position),
      -dot(zAxis, this.position),
      1,
    ];
  }

  // Get direction from camera to target
  getForward() {
    return normalize(subtract(this.target, this.position));
  }

  // Get camera right vector
  getRight() {
    const forward = this.getForward();
    return normalize(cross(this.up, forward));
  }
}

// Factory for isometric camera view
export function createIsometricCamera(system = 'RHS') {
  const camera = new Camera({ coordinateSystem: system });
  camera.setCoordinateSystem(system);
  // Isometric: 35.264° from horizontal, 45° rotation
  camera.setFromEuler(
    (35.264 * Math.PI) / 180,
    (45 * Math.PI) / 180,
    0,
    5
  );
  return camera;
}

// Factory for front view camera
export function createFrontCamera(system = 'RHS') {
  const camera = new Camera({ coordinateSystem: system });
  camera.setCoordinateSystem(system);
  camera.setFromEuler(0, 0, 0, 5);
  return camera;
}

// Factory for top view camera
export function createTopCamera(system = 'RHS') {
  const camera = new Camera({ coordinateSystem: system });
  camera.setCoordinateSystem(system);
  camera.setFromEuler((90 * Math.PI) / 180, 0, 0, 5);
  return camera;
}

// Factory for side view camera
export function createSideCamera(system = 'RHS') {
  const camera = new Camera({ coordinateSystem: system });
  camera.setCoordinateSystem(system);
  camera.setFromEuler(0, (90 * Math.PI) / 180, 0, 5);
  return camera;
}
