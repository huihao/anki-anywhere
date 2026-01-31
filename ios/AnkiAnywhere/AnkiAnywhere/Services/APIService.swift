import Foundation

class APIService {
    static let shared = APIService()
    
    private let baseURL: String
    private var authToken: String?
    
    private init() {
        self.baseURL = UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:3000/api"
        self.authToken = UserDefaults.standard.string(forKey: "authToken")
    }
    
    func setAuthToken(_ token: String) {
        self.authToken = token
        UserDefaults.standard.set(token, forKey: "authToken")
    }
    
    func setBaseURL(_ url: String) {
        UserDefaults.standard.set(url, forKey: "apiBaseURL")
    }
    
    private func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Data? = nil,
        completion: @escaping (Result<T, Error>) -> Void
    ) {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            completion(.failure(NSError(domain: "Invalid URL", code: -1, userInfo: nil)))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = body
        }
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "No data", code: -1, userInfo: nil)))
                return
            }
            
            do {
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .iso8601
                let result = try decoder.decode(T.self, from: data)
                completion(.success(result))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    // Deck APIs
    func getDecks(completion: @escaping (Result<[Deck], Error>) -> Void) {
        request(endpoint: "/decks", completion: completion)
    }
    
    func createDeck(name: String, description: String?, completion: @escaping (Result<Deck, Error>) -> Void) {
        let body = ["name": name, "description": description ?? ""]
        guard let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
            completion(.failure(NSError(domain: "JSON Error", code: -1, userInfo: nil)))
            return
        }
        request(endpoint: "/decks", method: "POST", body: jsonData, completion: completion)
    }
    
    // Card APIs
    func getCards(deckId: Int, completion: @escaping (Result<[Card], Error>) -> Void) {
        request(endpoint: "/cards/deck/\(deckId)", completion: completion)
    }
    
    func getRandomCards(deckId: Int, limit: Int = 10, completion: @escaping (Result<[Card], Error>) -> Void) {
        request(endpoint: "/cards/deck/\(deckId)/random?limit=\(limit)", completion: completion)
    }
    
    // Review APIs
    func reviewCard(cardId: Int, quality: Int, completion: @escaping (Result<CardReview, Error>) -> Void) {
        let body = ["cardId": cardId, "quality": quality] as [String : Any]
        guard let jsonData = try? JSONSerialization.data(withJSONObject: body) else {
            completion(.failure(NSError(domain: "JSON Error", code: -1, userInfo: nil)))
            return
        }
        request(endpoint: "/reviews/review", method: "POST", body: jsonData, completion: completion)
    }
    
    func getDueCards(deckId: Int? = nil, completion: @escaping (Result<[Card], Error>) -> Void) {
        let endpoint = deckId != nil ? "/reviews/due?deckId=\(deckId!)" : "/reviews/due"
        request(endpoint: endpoint, completion: completion)
    }
}
