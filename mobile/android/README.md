# Anki Anywhere Android

Native Android app (Kotlin) plan:
- Fetch decks and cards from backend `/decks` and `/cards` endpoints.
- Implement SM-2 scheduling logic using local state.
- Random browsing uses `/decks/:deckId/cards/random`.

Kotlin scheduling helper:
```kotlin
data class ReviewResult(val intervalDays: Int, val easeFactor: Double, val repetitions: Int)

fun scheduleReview(score: Int, intervalDays: Int, easeFactor: Double, repetitions: Int): ReviewResult {
    var newRepetitions = repetitions
    var newInterval = intervalDays
    var newEase = easeFactor

    if (score < 3) {
        newRepetitions = 0
        newInterval = 1
    } else {
        newRepetitions += 1
        newInterval = when (newRepetitions) {
            1 -> 1
            2 -> 6
            else -> (newInterval * newEase).toInt()
        }
        val diff = 5 - score
        newEase = kotlin.math.max(1.3, newEase + (0.1 - diff * (0.08 + diff * 0.02)))
    }

    return ReviewResult(newInterval, newEase, newRepetitions)
}
```
