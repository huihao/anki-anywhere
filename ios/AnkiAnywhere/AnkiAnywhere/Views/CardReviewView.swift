import SwiftUI

struct CardReviewView: View {
    let deck: Deck
    @StateObject private var viewModel: CardReviewViewModel
    
    init(deck: Deck) {
        self.deck = deck
        _viewModel = StateObject(wrappedValue: CardReviewViewModel(deckId: deck.id))
    }
    
    var body: some View {
        VStack {
            if viewModel.isLoading {
                ProgressView()
            } else if let currentCard = viewModel.currentCard {
                VStack(spacing: 20) {
                    Text("卡片 \(viewModel.currentIndex + 1) / \(viewModel.cards.count)")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Spacer()
                    
                    VStack {
                        Text(viewModel.showAnswer ? "答案" : "问题")
                            .font(.caption)
                            .foregroundColor(.gray)
                        
                        Text(viewModel.showAnswer ? viewModel.cardAnswerText(currentCard) : viewModel.cardQuestionText(currentCard))
                            .font(.title2)
                            .multilineTextAlignment(.center)
                            .padding()
                    }
                    
                    Spacer()
                    
                    if viewModel.showAnswer {
                        VStack(spacing: 10) {
                            Text("回答质量:")
                                .font(.headline)
                            
                            HStack(spacing: 12) {
                                ForEach(ReviewRating.allCases, id: \.self) { rating in
                                    Button(action: {
                                        viewModel.reviewCard(quality: rating.quality)
                                    }) {
                                        VStack {
                                            Text(rating.label)
                                                .font(.caption)
                                            Text(rating.subtitle)
                                                .font(.caption2)
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 8)
                                        .background(rating.color)
                                        .foregroundColor(.white)
                                        .cornerRadius(8)
                                    }
                                }
                            }
                            
                            if let hint = viewModel.intervalHint {
                                Text(hint)
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                        }
                        .padding()
                    } else {
                        Button(action: {
                            viewModel.showAnswer = true
                        }) {
                            Text("显示答案")
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                        }
                        .padding()
                    }
                }
            } else {
                VStack {
                    Text("没有待复习的卡片")
                        .font(.title2)
                    Button(action: {
                        viewModel.loadRandomCards()
                    }) {
                        Text("随机浏览卡片")
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                    }
                }
            }
        }
        .navigationTitle(deck.name)
        .padding()
        .onAppear {
            viewModel.loadDueCards()
        }
    }
    
    func qualityColor(_ quality: Int) -> Color {
        switch quality {
        case 0...1: return .red
        case 2: return .orange
        case 3: return .yellow
        case 4: return .green
        case 5: return .blue
        default: return .gray
        }
    }
}

enum ReviewRating: CaseIterable {
    case again
    case hard
    case good
    case easy

    static let qualityAgain = 1
    static let qualityHard = 3
    static let qualityGood = 4
    static let qualityEasy = 5
    
    var label: String {
        switch self {
        case .again: return "Again"
        case .hard: return "Hard"
        case .good: return "Good"
        case .easy: return "Easy"
        }
    }
    
    var subtitle: String {
        switch self {
        case .again: return "忘记"
        case .hard: return "困难"
        case .good: return "记住"
        case .easy: return "轻松"
        }
    }
    
    var quality: Int {
        switch self {
        case .again: return Self.qualityAgain
        case .hard: return Self.qualityHard
        case .good: return Self.qualityGood
        case .easy: return Self.qualityEasy
        }
    }
    
    var color: Color {
        switch self {
        case .again: return .red
        case .hard: return .orange
        case .good: return .green
        case .easy: return .blue
        }
    }
}

class CardReviewViewModel: ObservableObject {
    let deckId: Int
    @Published var cards: [Card] = []
    @Published var currentIndex = 0
    @Published var showAnswer = false
    @Published var isLoading = false
    @Published var intervalHint: String?
    private var newCardsLimit: Int = 20
    private var reviewCardsLimit: Int = 100
    private let relearningMinutesAgain = 10
    private let relearningMinutesHard = 60
    
    var currentCard: Card? {
        guard currentIndex < cards.count else { return nil }
        return cards[currentIndex]
    }
    
    init(deckId: Int) {
        self.deckId = deckId
    }
    
    func loadDueCards() {
        isLoading = true
        APIService.shared.getDueCards(deckId: deckId) { [weak self] result in
            DispatchQueue.main.async {
                self?.isLoading = false
                switch result {
                case .success(let cards):
                    self?.applyReviewLimits(cards)
                    self?.currentIndex = 0
                    self?.showAnswer = false
                    self?.intervalHint = nil
                case .failure(let error):
                    print("Error loading due cards: \(error)")
                }
            }
        }
    }
    
    func loadRandomCards() {
        isLoading = true
        APIService.shared.getRandomCards(deckId: deckId, limit: 10) { [weak self] result in
            DispatchQueue.main.async {
                self?.isLoading = false
                switch result {
                case .success(let cards):
                    self?.applyNewLimits(cards)
                    self?.currentIndex = 0
                    self?.showAnswer = false
                    self?.intervalHint = nil
                case .failure(let error):
                    print("Error loading random cards: \(error)")
                }
            }
        }
    }
    
    func reviewCard(quality: Int) {
        guard let card = currentCard else { return }
        
        APIService.shared.reviewCard(cardId: card.id, quality: quality) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(let review):
                    self?.updateIntervalHint(quality: quality, interval: review.interval)
                    self?.nextCard()
                case .failure(let error):
                    print("Error reviewing card: \(error)")
                }
            }
        }
    }
    
    func nextCard() {
        if currentIndex < cards.count - 1 {
            currentIndex += 1
            showAnswer = false
            intervalHint = nil
        } else {
            cards = []
            currentIndex = 0
            intervalHint = nil
        }
    }

    private func applyNewLimits(_ loadedCards: [Card]) {
        loadSessionLimits()
        cards = Array(loadedCards.prefix(newCardsLimit))
    }

    private func applyReviewLimits(_ loadedCards: [Card]) {
        loadSessionLimits()
        let (reviewCards, newCards) = loadedCards.partitioned { ($0.repetitions ?? 0) > 0 }
        let limitedReview = Array(reviewCards.prefix(reviewCardsLimit))
        let limitedNew = Array(newCards.prefix(newCardsLimit))
        cards = limitedReview + limitedNew
    }

    private func loadSessionLimits() {
        let newLimit = (UserDefaults.standard.object(forKey: "newCardsLimit") as? Int) ?? 20
        let reviewLimit = (UserDefaults.standard.object(forKey: "reviewCardsLimit") as? Int) ?? 100
        newCardsLimit = newLimit
        reviewCardsLimit = reviewLimit
    }

    private func updateIntervalHint(quality: Int, interval: Int) {
        if quality >= ReviewRating.qualityHard {
            intervalHint = "下次复习: \(interval)天后"
        } else {
            intervalHint = "进入短期复习 (\(relearningMinutesAgain)-\(relearningMinutesHard)分钟内)"
        }
    }

    func cardQuestionText(_ card: Card) -> String {
        renderCloze(text: card.front, reveal: false)
    }

    func cardAnswerText(_ card: Card) -> String {
        let base = card.back.isEmpty ? card.front : card.back
        return renderCloze(text: base, reveal: true)
    }

    private func renderCloze(text: String, reveal: Bool) -> String {
        let pattern = #"\{\{c\d+::(.*?)(::(.*?))?}}"#
        guard let regex = try? NSRegularExpression(pattern: pattern, options: [.dotMatchesLineSeparators]) else {
            return text
        }
        let nsText = text as NSString
        let matches = regex.matches(in: text, options: [], range: NSRange(location: 0, length: nsText.length))
        if matches.isEmpty {
            return text
        }
        var result = text
        for match in matches.reversed() {
            let answerRange = match.range(at: 1)
            let hintRange = match.range(at: 3)
            let answer = answerRange.location != NSNotFound ? nsText.substring(with: answerRange) : ""
            let hint = hintRange.location != NSNotFound ? nsText.substring(with: hintRange) : ""
            let replacement: String
            if reveal {
                replacement = answer
            } else if !hint.isEmpty {
                replacement = "[\(hint)]"
            } else {
                replacement = "..."
            }
            result = (result as NSString).replacingCharacters(in: match.range, with: replacement)
        }
        return result
    }
}

private extension Array {
    func partitioned(by predicate: (Element) -> Bool) -> ([Element], [Element]) {
        var matching: [Element] = []
        var nonMatching: [Element] = []
        for element in self {
            if predicate(element) {
                matching.append(element)
            } else {
                nonMatching.append(element)
            }
        }
        return (matching, nonMatching)
    }
}
