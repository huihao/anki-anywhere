# Anki Anywhere iOS

Native iOS app (Swift) plan:
- Fetch decks and cards from backend `/decks` and `/cards` endpoints.
- Implement SM-2 scheduling logic using local state.
- Random browsing uses `/decks/:deckId/cards/random`.

Swift scheduling helper:
```swift
struct ReviewResult {
  let intervalDays: Int
  let easeFactor: Double
  let repetitions: Int
}

func scheduleReview(score: Int, intervalDays: Int, easeFactor: Double, repetitions: Int) -> ReviewResult {
  var newRepetitions = repetitions
  var newInterval = intervalDays
  var newEase = easeFactor

  if score < 3 {
    newRepetitions = 0
    newInterval = 1
  } else {
    newRepetitions += 1
    if newRepetitions == 1 {
      newInterval = 1
    } else if newRepetitions == 2 {
      newInterval = 6
    } else {
      newInterval = Int(Double(newInterval) * newEase)
    }
    let diff = 5 - score
    newEase = max(1.3, newEase + (0.1 - Double(diff) * (0.08 + Double(diff) * 0.02)))
  }

  return ReviewResult(intervalDays: newInterval, easeFactor: newEase, repetitions: newRepetitions)
}
```
