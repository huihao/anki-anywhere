import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = DeckListViewModel()
    
    var body: some View {
        NavigationView {
            List {
                ForEach(viewModel.decks) { deck in
                    NavigationLink(destination: CardReviewView(deck: deck)) {
                        VStack(alignment: .leading) {
                            Text(deck.name)
                                .font(.headline)
                            if let description = deck.description {
                                Text(description)
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                }
            }
            .navigationTitle("卡牌组")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    NavigationLink(destination: SettingsView()) {
                        Image(systemName: "gear")
                    }
                }
            }
            .onAppear {
                viewModel.loadDecks()
            }
        }
    }
}

class DeckListViewModel: ObservableObject {
    @Published var decks: [Deck] = []
    @Published var isLoading = false
    @Published var error: String?
    
    func loadDecks() {
        isLoading = true
        APIService.shared.getDecks { [weak self] result in
            DispatchQueue.main.async {
                self?.isLoading = false
                switch result {
                case .success(let decks):
                    self?.decks = decks
                case .failure(let error):
                    self?.error = error.localizedDescription
                }
            }
        }
    }
}
