/**
 * ProxiSpeak Distance & Spatial Mathematics Utilities
 */

/**
 * Calculate standard Euclidean distance between two 2D coordinates:
 * d = sqrt((x2 - x1)^2 + (y2 - y1)^2)
 */
export const calculateEuclideanDistance = (p1, p2) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.hypot(dx, dy);
};

/**
 * Fast proximity check without expensive square-root operation.
 */
export const isWithinRadius = (p1, p2, radius) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy <= radius * radius;
};

/**
 * Calculate audio attenuation (gain factor between 0.0 and 1.0)
 * @param {number} distance - Distance in pixels
 * @param {number} maxRadius - Maximum hearing distance (default 100px)
 * @param {number} minRadius - Zone of full volume (default 20px)
 * @param {number} rolloffFactor - Curve steepness (default 1.2)
 * @returns {number} Audio gain from 0.0 to 1.0
 */
export const calculateDistanceAttenuation = (
  distance,
  maxRadius = 100,
  minRadius = 20,
  rolloffFactor = 1.2
) => {
  if (distance <= minRadius) return 1.0;
  if (distance >= maxRadius) return 0.0;

  const normalized = (maxRadius - distance) / (maxRadius - minRadius);
  const gain = Math.pow(Math.max(0, Math.min(1, normalized)), rolloffFactor);
  return Number(gain.toFixed(3));
};

/**
 * Calculate stereo panning position from listener (p1) to source (p2)
 * @param {object} listener - { x, y }
 * @param {object} source - { x, y }
 * @param {number} maxRadius - Earshot radius
 * @returns {number} Pan between -1.0 (hard left) and +1.0 (hard right)
 */
export const calculateStereoPan = (listener, source, maxRadius = 100) => {
  const dx = source.x - listener.x;
  // Direct horizontal offset normalized by max radius
  const rawPan = dx / maxRadius;
  const clampedPan = Math.max(-1.0, Math.min(1.0, rawPan));
  return Number(clampedPan.toFixed(3));
};

/**
 * Check if a point is inside an axis-aligned bounding box (obstacle)
 */
export const isPointInBox = (point, box) => {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
};

/**
 * Helper: Line segment intersection test
 */
const lineSegmentIntersects = (p1, p2, p3, p4) => {
  const ccw = (a, b, c) => (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
};

/**
 * Check if the direct audio ray between listener and speaker intersects an obstacle box
 */
export const lineIntersectsObstacle = (p1, p2, box) => {
  const topLeft = { x: box.x, y: box.y };
  const topRight = { x: box.x + box.width, y: box.y };
  const bottomLeft = { x: box.x, y: box.y + box.height };
  const bottomRight = { x: box.x + box.width, y: box.y + box.height };

  return (
    lineSegmentIntersects(p1, p2, topLeft, topRight) ||
    lineSegmentIntersects(p1, p2, topRight, bottomRight) ||
    lineSegmentIntersects(p1, p2, bottomRight, bottomLeft) ||
    lineSegmentIntersects(p1, p2, bottomLeft, topLeft)
  );
};

/**
 * Calculate combined obstacle sound attenuation factor along the audio path
 * @param {object} p1 - Listener { x, y }
 * @param {object} p2 - Speaker { x, y }
 * @param {Array} obstacles - List of obstacles with { x, y, width, height, soundDamping }
 * @returns {number} Sound multiplier between 0.0 (fully blocked) and 1.0 (unobstructed)
 */
export const calculateObstacleDamping = (p1, p2, obstacles = []) => {
  let multiplier = 1.0;
  for (const obs of obstacles) {
    if (obs.soundDamping && obs.soundDamping > 0) {
      if (lineIntersectsObstacle(p1, p2, obs)) {
        multiplier *= 1.0 - obs.soundDamping;
      }
    }
  }
  return Math.max(0.0, multiplier);
};
