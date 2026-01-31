import { scheduleReview } from './scheduler.js';

const assertEqual = (value, expected, message) => {
  if (value !== expected) {
    throw new Error(`${message} (got ${value}, expected ${expected})`);
  }
};

const run = () => {
  const first = scheduleReview(5, { intervalDays: 0, easeFactor: 2.5, repetitions: 0 });
  assertEqual(first.intervalDays, 1, 'First review interval should be 1');
  assertEqual(first.repetitions, 1, 'First review repetitions should be 1');

  const second = scheduleReview(5, { intervalDays: first.intervalDays, easeFactor: first.easeFactor, repetitions: first.repetitions });
  assertEqual(second.intervalDays, 6, 'Second review interval should be 6');
  assertEqual(second.repetitions, 2, 'Second review repetitions should be 2');

  const lapse = scheduleReview(1, { intervalDays: 10, easeFactor: 2.5, repetitions: 4 });
  assertEqual(lapse.intervalDays, 1, 'Lapse should reset interval to 1');
  assertEqual(lapse.repetitions, 0, 'Lapse should reset repetitions');

  console.log('Scheduler tests passed');
};

try {
  run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
