import { migrateAndSeed } from "./db";

let done = false;
export function ensureSeeded() {
  if (done) return;
  migrateAndSeed();
  done = true;
}
