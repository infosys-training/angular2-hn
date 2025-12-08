import Foundation

/// Implementation of the StoryRepository protocol
/// Provides an abstraction layer for the UI to interact with the Hacker News API
public final class StoryRepository: StoryRepositoryProtocol, @unchecked Sendable {
    private let apiClient: HackerNewsAPIClientProtocol
    
    /// Initializes the repository with an API client
    /// - Parameter apiClient: The API client to use for network requests (defaults to HackerNewsAPIClient)
    public init(apiClient: HackerNewsAPIClientProtocol = HackerNewsAPIClient()) {
        self.apiClient = apiClient
    }
    
    /// Fetches a feed of stories
    /// - Parameters:
    ///   - feedType: The type of feed to fetch (news, newest, ask, show, jobs)
    ///   - page: The page number for pagination (1-indexed)
    /// - Returns: An array of Story objects
    public func getStories(feedType: String, page: Int) async throws -> [Story] {
        return try await apiClient.fetchFeed(feedType: feedType, page: page)
    }
    
    /// Fetches a single story with full content and comments
    /// If the story is a poll, poll options are automatically fetched and aggregated
    /// - Parameter id: The story ID
    /// - Returns: A Story object with full content
    public func getStory(id: Int) async throws -> Story {
        return try await apiClient.fetchItemContent(id: id)
    }
    
    /// Fetches a user profile
    /// - Parameter id: The user ID/username
    /// - Returns: A User object
    public func getUser(id: String) async throws -> User {
        return try await apiClient.fetchUser(id: id)
    }
}

/// Extension providing convenience methods for common feed types
extension StoryRepository {
    /// Fetches the top/news stories
    /// - Parameter page: The page number for pagination
    /// - Returns: An array of top stories
    public func getTopStories(page: Int = 1) async throws -> [Story] {
        return try await getStories(feedType: "news", page: page)
    }
    
    /// Fetches the newest stories
    /// - Parameter page: The page number for pagination
    /// - Returns: An array of newest stories
    public func getNewestStories(page: Int = 1) async throws -> [Story] {
        return try await getStories(feedType: "newest", page: page)
    }
    
    /// Fetches ask HN stories
    /// - Parameter page: The page number for pagination
    /// - Returns: An array of ask stories
    public func getAskStories(page: Int = 1) async throws -> [Story] {
        return try await getStories(feedType: "ask", page: page)
    }
    
    /// Fetches show HN stories
    /// - Parameter page: The page number for pagination
    /// - Returns: An array of show stories
    public func getShowStories(page: Int = 1) async throws -> [Story] {
        return try await getStories(feedType: "show", page: page)
    }
    
    /// Fetches job postings
    /// - Parameter page: The page number for pagination
    /// - Returns: An array of job stories
    public func getJobStories(page: Int = 1) async throws -> [Story] {
        return try await getStories(feedType: "jobs", page: page)
    }
}
