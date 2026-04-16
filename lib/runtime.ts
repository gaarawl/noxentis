export function isLiveMode() {
  return process.env.DEMO_MODE === "false" && Boolean(process.env.DATABASE_URL);
}

export function isDemoMode() {
  return !isLiveMode();
}
