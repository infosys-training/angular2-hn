import Foundation

/// Protocol defining the Hacker News API client interface for dependency injection and testing
public protocol HackerNewsAPIClientProtocol: Sendable {
    /// Fetches a feed of stories based on feed type and page number
    /// - Parameters:
    ///   - feedType: The type of feed to fetch (news, newest, ask, show, jobs)
    ///   - page: The page number for pagination
    /// - Returns: An array of Story objects
    func fetchFeed(feedType: String, page: Int) async throws -> [Story]
    
    /// Fetches the content of a specific item including comments
    /// - Parameter id: The item ID
    /// - Returns: A Story object with full content and comments
    func fetchItemContent(id: Int) async throws -> Story
    
    /// Fetches poll content for a specific poll option
    /// - Parameter id: The poll option ID
    /// - Returns: A PollResult object
    func fetchPollContent(id: Int) async throws -> PollResult
    
    /// Fetches a user profile
    /// - Parameter id: The user ID/username
    /// - Returns: A User object
    func fetchUser(id: String) async throws -> User
}
