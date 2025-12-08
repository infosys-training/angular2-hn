import Foundation

/// Protocol defining the repository interface for story-related operations
/// Provides an abstraction layer between the UI and the API client
public protocol StoryRepositoryProtocol: Sendable {
    /// Fetches a feed of stories
    /// - Parameters:
    ///   - feedType: The type of feed to fetch
    ///   - page: The page number for pagination
    /// - Returns: An array of Story objects
    func getStories(feedType: String, page: Int) async throws -> [Story]
    
    /// Fetches a single story with full content and comments
    /// - Parameter id: The story ID
    /// - Returns: A Story object with full content
    func getStory(id: Int) async throws -> Story
    
    /// Fetches a user profile
    /// - Parameter id: The user ID/username
    /// - Returns: A User object
    func getUser(id: String) async throws -> User
}
