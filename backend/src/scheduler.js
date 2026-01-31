export function scheduleReview(score, { intervalDays, easeFactor, repetitions }) {
  let newRepetitions = repetitions;
  let newInterval = intervalDays;
  let newEase = easeFactor;

  if (score < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions += 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(newInterval * newEase);
    }
    newEase = Math.max(1.3, newEase + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02)));
  }

  return { intervalDays: newInterval, easeFactor: newEase, repetitions: newRepetitions };
}
