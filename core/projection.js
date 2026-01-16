// Projection utilities for 3D to 2D transformation

export const PROJECTION_TYPES = {
  PERSPECTIVE: 'perspective',
  ORTHOGRAPHIC: 'orthographic',
};

export class Projector {
  constructor(options = {}) {
    this.width = options.width || 400;
    this.height = options.height || 400;
    this.type = options.type || PROJECTION_TYPES.PERSPECTIVE;
    this.focalLength = options.focalLength || 4;
    this.scale = options.scale || 100;
    this.coordinateSystem = options.coordinateSystem || 'RHS';
  }

  // Set projection type
  setType(type) {
    this.type = type;
  }

  // Set coordinate system
  setCoordinateSystem(system) {
    this.coordinateSystem = system;
  }

  // Project a 3D point to 2D screen coordinates
  project(point) {
    const [x, y, z] = point;

    let screenX, screenY;

    if (this.type === PROJECTION_TYPES.PERSPECTIVE) {
      const perspectiveScale = this.focalLength / (this.focalLength + z);
      screenX = this.width / 2 + x * perspectiveScale * this.scale;
      screenY = this.height / 2 + y * perspectiveScale * this.scale;
    } else {
      // Orthographic
      screenX = this.width / 2 + x * this.scale;
      screenY = this.height / 2 + y * this.scale;
    }

    return [screenX, screenY];
  }

  // Project an array of points
  projectAll(points) {
    return points.map(p => this.project(p));
  }
}

// Factory functions for common projector setups
export function createDefaultProjector(width = 400, height = 400) {
  return new Projector({ width, height });
}
