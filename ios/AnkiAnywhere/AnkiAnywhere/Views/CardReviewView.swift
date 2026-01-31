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
                        
                        Text(viewModel.showAnswer ? currentCard.back : currentCard.front)
                            .font(.title2)
                            .multilineTextAlignment(.center)
                            .padding()
                    }
                    
                    Spacer()
                    
                    if viewModel.showAnswer {
                        VStack(spacing: 10) {
                            Text("回答质量:")
                                .font(.headline)
                            
                            HStack(spacing: 10) {
                                ForEach(0..<6) { quality in
                                    Button(action: {
                                        viewModel.reviewCard(quality: quality)
                                    }) {
                                        Text("\(quality)")
                                            .frame(width: 40, height: 40)
                                            .background(qualityColor(quality))
                                            .foregroundColor(.white)
                                            .cornerRadius(8)
                                    }
                                }
                            }
                            
                            Text("0=完全忘记, 5=完美记忆")
                                .font(.caption)
                                .foregroundColor(.gray)
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

class CardReviewViewModel: ObservableObject {
    let deckId: Int
    @Published var cards: [Card] = []
    @Published var currentIndex = 0
    @Published var showAnswer = false
    @Published var isLoading = false
    
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
                    self?.cards = cards
                    self?.currentIndex = 0
                    self?.showAnswer = false
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
                    self?.cards = cards
                    self?.currentIndex = 0
                    self?.showAnswer = false
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
                case .success:
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
        } else {
            cards = []
            currentIndex = 0
        }
    }
}
