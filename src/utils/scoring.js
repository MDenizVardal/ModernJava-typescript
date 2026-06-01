// Returns the points multiplier for the current streak.
// Every correct answer in a row climbs one tier (max 3×).
// One wrong answer resets the streak to 0, dropping back to 1×.
export function getMultiplier(streak) {
  if (streak <= 0) return 1;    // no streak – base points
  if (streak === 1) return 1.5; // 1 in a row  – small boost
  if (streak === 2) return 2;   // 2 in a row  – double points
  if (streak === 3) return 2.5; // 3 in a row  – big boost
  return 3;                     // 4+ in a row – maximum multiplier
}

// Maps a streak count to a CSS level name used for badge colouring.
// base → grey, low → cyan, mid → gold, high → orange, max → red
export function getMultiplierLevel(streak) {
  if (streak <= 0) return "base";
  if (streak === 1) return "low";
  if (streak === 2) return "mid";
  if (streak === 3) return "high";
  return "max";
}
