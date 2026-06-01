export function getMultiplier(streak) {
  if (streak <= 0) return 1;
  if (streak === 1) return 1.5;
  if (streak === 2) return 2;
  if (streak === 3) return 2.5;
  return 3;
}

export function getMultiplierLevel(streak) {
  if (streak <= 0) return "base";
  if (streak === 1) return "low";
  if (streak === 2) return "mid";
  if (streak === 3) return "high";
  return "max";
}
