package com.ankianywhere.services

class SpacedRepetitionService {
    data class ReviewResult(
        val easeFactor: Double,
        val interval: Int,
        val repetitions: Int
    )
    
    // SM-2 算法实现
    fun calculateNextReview(
        currentEaseFactor: Double,
        currentInterval: Int,
        currentRepetitions: Int,
        quality: Int
    ): ReviewResult {
        var easeFactor = currentEaseFactor
        var interval = currentInterval
        var repetitions = currentRepetitions
        
        if (quality >= 3) {
            // 回答正确
            interval = when (repetitions) {
                0 -> 1
                1 -> 6
                else -> (interval * easeFactor).toInt()
            }
            repetitions += 1
        } else {
            // 回答错误，重置
            repetitions = 0
            interval = 1
        }
        
        // 更新ease factor
        easeFactor += (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        if (easeFactor < 1.3) {
            easeFactor = 1.3
        }
        
        return ReviewResult(easeFactor, interval, repetitions)
    }
    
    companion object {
        val instance = SpacedRepetitionService()
    }
}
