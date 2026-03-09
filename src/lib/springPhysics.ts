/**
 * Spring physics simulation for ticking second hand overshoot.
 * Uses a damped spring model.
 */

interface SpringConfig {
  stiffness: number;  // spring constant (higher = faster snap)
  damping: number;    // friction (higher = less bounce)
  mass: number;       // mass of the object
}

interface SpringState {
  position: number;
  velocity: number;
}

export const TICKING_SPRING_CONFIG: SpringConfig = {
  stiffness: 300,
  damping: 15,
  mass: 1,
};

/**
 * Advance a spring simulation by dt seconds.
 * Returns new position and velocity.
 */
export function springStep(
  state: SpringState,
  target: number,
  config: SpringConfig,
  dt: number
): SpringState {
  const { stiffness, damping, mass } = config;
  const displacement = state.position - target;
  const springForce = -stiffness * displacement;
  const dampingForce = -damping * state.velocity;
  const acceleration = (springForce + dampingForce) / mass;

  const newVelocity = state.velocity + acceleration * dt;
  const newPosition = state.position + newVelocity * dt;

  return {
    position: newPosition,
    velocity: newVelocity,
  };
}

/**
 * Check if spring has settled close enough to target
 */
export function isSpringSettled(
  state: SpringState,
  target: number,
  threshold: number = 0.1
): boolean {
  return (
    Math.abs(state.position - target) < threshold &&
    Math.abs(state.velocity) < threshold
  );
}
