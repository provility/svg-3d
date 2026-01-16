import { createAxis } from '../shapes/axis.js';

// Create the 3 coordinate axes with ticks and labels
// All axes pass through the origin (0,0,0)
// Adapts to the specified coordinate system
export function createCoordinateAxes(system = 'RHS') {
  if (system === 'LHS') {
    // LHS: Z is up, X is forward, Y is right
    return [
      // X axis (red) - forward (into screen in default view)
      {
        axis: createAxis([-1.5, 0, 0], [1.5, 0, 0], {
          ticks: 7,
          tickLength: 0.1,
          tickDirection: [0, 0, 1],
          labels: ['-1.5', '-1', '-0.5', '0', '0.5', '1', '1.5']
        }),
        color: '#cc0000',
        name: 'X (forward)'
      },
      // Y axis (green) - right
      {
        axis: createAxis([0, -1.5, 0], [0, 1.5, 0], {
          ticks: 7,
          tickLength: 0.1,
          tickDirection: [0, 0, 1],
          labels: ['-1.5', '-1', '-0.5', '0', '0.5', '1', '1.5']
        }),
        color: '#00aa00',
        name: 'Y (right)'
      },
      // Z axis (blue) - up
      {
        axis: createAxis([0, 0, -1.5], [0, 0, 1.5], {
          ticks: 7,
          tickLength: 0.1,
          tickDirection: [1, 0, 0],
          labels: ['-1.5', '-1', '-0.5', '0', '0.5', '1', '1.5']
        }),
        color: '#0066cc',
        name: 'Z (up)'
      }
    ];
  }

  // RHS: Y is up, X is right, -Z is forward
  return [
    // X axis (red) - right
    {
      axis: createAxis([-1.5, 0, 0], [1.5, 0, 0], {
        ticks: 7,
        tickLength: 0.1,
        tickDirection: [0, 1, 0],
        labels: ['-1.5', '-1', '-0.5', '0', '0.5', '1', '1.5']
      }),
      color: '#cc0000',
      name: 'X (right)'
    },
    // Y axis (green) - up
    {
      axis: createAxis([0, -1.5, 0], [0, 1.5, 0], {
        ticks: 7,
        tickLength: 0.1,
        tickDirection: [1, 0, 0],
        labels: ['-1.5', '-1', '-0.5', '0', '0.5', '1', '1.5']
      }),
      color: '#00aa00',
      name: 'Y (up)'
    },
    // Z axis (blue) - forward/backward
    {
      axis: createAxis([0, 0, -1.5], [0, 0, 1.5], {
        ticks: 7,
        tickLength: 0.1,
        tickDirection: [0, 1, 0],
        labels: ['-1.5', '-1', '-0.5', '0', '0.5', '1', '1.5']
      }),
      color: '#0066cc',
      name: 'Z (depth)'
    }
  ];
}
