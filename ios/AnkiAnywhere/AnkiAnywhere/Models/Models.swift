import Foundation

struct Deck: Codable, Identifiable {
    let id: Int
    let userId: Int
    let name: String
    let description: String?
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case name
        case description
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct Card: Codable, Identifiable {
    let id: Int
    let deckId: Int
    let front: String
    let back: String
    let sourceUrl: String?
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case deckId = "deck_id"
        case front
        case back
        case sourceUrl = "source_url"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct CardReview: Codable {
    let id: Int
    let cardId: Int
    let userId: Int
    let easeFactor: Double
    let interval: Int
    let repetitions: Int
    let nextReviewDate: Date
    let lastReviewDate: Date?
    
    enum CodingKeys: String, CodingKey {
        case id
        case cardId = "card_id"
        case userId = "user_id"
        case easeFactor = "ease_factor"
        case interval
        case repetitions
        case nextReviewDate = "next_review_date"
        case lastReviewDate = "last_review_date"
    }
}
