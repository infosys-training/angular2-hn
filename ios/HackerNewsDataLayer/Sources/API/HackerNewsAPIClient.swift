import Foundation

/// Implementation of the Hacker News API client using URLSession and async/await
public final class HackerNewsAPIClient: HackerNewsAPIClientProtocol, @unchecked Sendable {
    private let baseURL: String
    private let session: URLSession
    private let decoder: JSONDecoder
    
    public init(
        baseURL: String = "https://node-hnapi.herokuapp.com",
        session: URLSession = .shared
    ) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = JSONDecoder()
    }
    
    /// Fetches a feed of stories based on feed type and page number
    /// - Parameters:
    ///   - feedType: The type of feed to fetch (news, newest, ask, show, jobs)
    ///   - page: The page number for pagination
    /// - Returns: An array of Story objects
    public func fetchFeed(feedType: String, page: Int) async throws -> [Story] {
        let urlString = "\(baseURL)/\(feedType)?page=\(page)"
        return try await performRequest(urlString: urlString)
    }
    
    /// Fetches the content of a specific item including comments
    /// If the item is a poll, it fetches poll options and aggregates vote counts
    /// - Parameter id: The item ID
    /// - Returns: A Story object with full content and comments
    public func fetchItemContent(id: Int) async throws -> Story {
        let urlString = "\(baseURL)/item/\(id)"
        var story: Story = try await performRequest(urlString: urlString)
        
        if story.type == .poll {
            story = try await fetchPollOptions(for: story)
        }
        
        return story
    }
    
    /// Fetches poll content for a specific poll option
    /// - Parameter id: The poll option ID
    /// - Returns: A PollResult object
    public func fetchPollContent(id: Int) async throws -> PollResult {
        let urlString = "\(baseURL)/item/\(id)"
        return try await performRequest(urlString: urlString)
    }
    
    /// Fetches a user profile
    /// - Parameter id: The user ID/username
    /// - Returns: A User object
    public func fetchUser(id: String) async throws -> User {
        let urlString = "\(baseURL)/user/\(id)"
        return try await performRequest(urlString: urlString)
    }
    
    /// Fetches poll options and aggregates vote counts
    /// Replicates the Angular service behavior where poll options are fetched
    /// by looping from story.id + 1 to story.id + numberOfPollOptions
    /// - Parameter story: The poll story
    /// - Returns: Updated story with poll results and aggregated vote count
    private func fetchPollOptions(for story: Story) async throws -> Story {
        var updatedStory = story
        let numberOfPollOptions = story.poll.count
        
        guard numberOfPollOptions > 0 else {
            return updatedStory
        }
        
        var pollResults: [PollResult] = Array(repeating: PollResult(points: 0, content: ""), count: numberOfPollOptions)
        var totalVotes = 0
        
        try await withThrowingTaskGroup(of: (Int, PollResult).self) { group in
            for i in 1...numberOfPollOptions {
                let pollOptionId = story.id + i
                let index = i - 1
                
                group.addTask {
                    let result = try await self.fetchPollContent(id: pollOptionId)
                    return (index, result)
                }
            }
            
            for try await (index, result) in group {
                pollResults[index] = result
                totalVotes += result.points
            }
        }
        
        updatedStory.poll = pollResults
        updatedStory.pollVotesCount = totalVotes
        
        return updatedStory
    }
    
    /// Performs a network request and decodes the response
    /// - Parameter urlString: The URL string to request
    /// - Returns: Decoded response of type T
    private func performRequest<T: Decodable>(urlString: String) async throws -> T {
        guard let url = URL(string: urlString) else {
            throw HackerNewsError.invalidURL
        }
        
        do {
            let (data, response) = try await session.data(from: url)
            
            try Task.checkCancellation()
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw HackerNewsError.unknown("Invalid response type")
            }
            
            guard (200...299).contains(httpResponse.statusCode) else {
                throw HackerNewsError.serverError(statusCode: httpResponse.statusCode)
            }
            
            guard !data.isEmpty else {
                throw HackerNewsError.noData
            }
            
            do {
                return try decoder.decode(T.self, from: data)
            } catch let decodingError {
                throw HackerNewsError.decodingError(decodingError.localizedDescription)
            }
        } catch is CancellationError {
            throw HackerNewsError.cancelled
        } catch let error as HackerNewsError {
            throw error
        } catch let error as URLError {
            throw HackerNewsError.networkError(error.localizedDescription)
        } catch {
            throw HackerNewsError.unknown(error.localizedDescription)
        }
    }
}

/// Extension providing cancellable task support similar to Angular's lazyFetch
extension HackerNewsAPIClient {
    /// Creates a cancellable task for fetching a feed
    /// - Parameters:
    ///   - feedType: The type of feed to fetch
    ///   - page: The page number for pagination
    /// - Returns: A Task that can be cancelled
    public func fetchFeedTask(feedType: String, page: Int) -> Task<[Story], Error> {
        return Task {
            try await self.fetchFeed(feedType: feedType, page: page)
        }
    }
    
    /// Creates a cancellable task for fetching item content
    /// - Parameter id: The item ID
    /// - Returns: A Task that can be cancelled
    public func fetchItemContentTask(id: Int) -> Task<Story, Error> {
        return Task {
            try await self.fetchItemContent(id: id)
        }
    }
    
    /// Creates a cancellable task for fetching a user
    /// - Parameter id: The user ID/username
    /// - Returns: A Task that can be cancelled
    public func fetchUserTask(id: String) -> Task<User, Error> {
        return Task {
            try await self.fetchUser(id: id)
        }
    }
}
