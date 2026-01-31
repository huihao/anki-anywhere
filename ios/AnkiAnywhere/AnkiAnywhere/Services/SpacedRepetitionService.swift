import Foundation

class SpacedRepetitionService {
    static let shared = SpacedRepetitionService()
    
    private init() {}
    
    // SM-2 算法实现
    func calculateNextReview(
        currentEaseFactor: Double,
        currentInterval: Int,
        currentRepetitions: Int,
        quality: Int
    ) -> (easeFactor: Double, interval: Int, repetitions: Int) {
        var easeFactor = currentEaseFactor
        var interval = currentInterval
        var repetitions = currentRepetitions
        
        if quality >= 3 {
            // 回答正确
            if repetitions == 0 {
                interval = 1
            } else if repetitions == 1 {
                interval = 6
            } else {
                interval = Int(Double(interval) * easeFactor)
            }
            repetitions += 1
        } else {
            // 回答错误，重置
            repetitions = 0
            interval = 1
        }
        
        // 更新ease factor
        easeFactor = easeFactor + (0.1 - Double(5 - quality) * (0.08 + Double(5 - quality) * 0.02))
        if easeFactor < 1.3 {
            easeFactor = 1.3
        }
        
        return (easeFactor, interval, repetitions)
    }
    
    func getNextReviewDate(interval: Int) -> Date {
        return Calendar.current.date(byAdding: .day, value: interval, to: Date()) ?? Date()
    }
}
