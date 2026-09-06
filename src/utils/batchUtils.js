export const uid = () => Math.random().toString(36).slice(2, 10);

export function getRequiredStages(batch) {
  if (batch.requiredStages) return batch.requiredStages;
  if (/broccoli|tenderstem/i.test(batch.veg)) {
    return ["Banging check", "Water 1", "Thrip cloth 1", "Water 2", "Thrip cloth 2"];
  }
  if (/cauliflower/i.test(batch.veg)) {
    return ["Visual check", "Water", "Thrip cloth"];
  }
  return ["Water", "Thrip cloth"];
}

export function nextStage(batch) {
  const cur = batch.history.filter(h => h.attempt === batch.attempt);
  const reqs = getRequiredStages(batch);
  for (const stage of reqs) {
    if (!cur.some(h => h.stage === stage && h.result === "Pass")) {
      return stage;
    }
  }
  return "Done";
}
