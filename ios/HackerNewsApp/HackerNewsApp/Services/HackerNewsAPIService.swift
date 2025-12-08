import Foundation
import Combine

protocol HackerNewsAPIServiceProtocol {
    func fetchFeed(feedType: FeedType, page: Int) -> AnyPublisher<[Story], Error>
    func fetchItemContent(id: Int) -> AnyPublisher<Story, Error>
    func fetchUser(id: String) -> AnyPublisher<User, Error>
}

class HackerNewsAPIService: ObservableObject, HackerNewsAPIServiceProtocol {
    private let baseURL = "https://node-hnapi.herokuapp.com"
    private let session: URLSession
    private let decoder: JSONDecoder
    
    init(session: URLSession = .shared) {
        self.session = session
        self.decoder = JSONDecoder()
    }
    
    func fetchFeed(feedType: FeedType, page: Int) -> AnyPublisher<[Story], Error> {
        let urlString = "\(baseURL)/\(feedType.rawValue)?page=\(page)"
        guard let url = URL(string: urlString) else {
            return Fail(error: APIError.invalidURL).eraseToAnyPublisher()
        }
        
        return session.dataTaskPublisher(for: url)
            .map(\.data)
            .decode(type: [Story].self, decoder: decoder)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func fetchItemContent(id: Int) -> AnyPublisher<Story, Error> {
        let urlString = "\(baseURL)/item/\(id)"
        guard let url = URL(string: urlString) else {
            return Fail(error: APIError.invalidURL).eraseToAnyPublisher()
        }
        
        return session.dataTaskPublisher(for: url)
            .map(\.data)
            .decode(type: Story.self, decoder: decoder)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func fetchUser(id: String) -> AnyPublisher<User, Error> {
        let urlString = "\(baseURL)/user/\(id)"
        guard let url = URL(string: urlString) else {
            return Fail(error: APIError.invalidURL).eraseToAnyPublisher()
        }
        
        return session.dataTaskPublisher(for: url)
            .map(\.data)
            .decode(type: User.self, decoder: decoder)
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
}

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case decodingError
    case networkError(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .decodingError:
            return "Failed to decode response"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        }
    }
}
