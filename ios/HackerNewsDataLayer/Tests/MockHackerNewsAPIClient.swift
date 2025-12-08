import Foundation
@testable import HackerNewsDataLayer

/// Mock implementation of HackerNewsAPIClientProtocol for testing
public final class MockHackerNewsAPIClient: HackerNewsAPIClientProtocol, @unchecked Sendable {
    public var feedResult: Result<[Story], Error> = .success([])
    public var itemResult: Result<Story, Error>?
    public var pollResult: Result<PollResult, Error>?
    public var userResult: Result<User, Error>?
    
    public var fetchFeedCallCount = 0
    public var fetchItemContentCallCount = 0
    public var fetchPollContentCallCount = 0
    public var fetchUserCallCount = 0
    
    public var lastFeedType: String?
    public var lastPage: Int?
    public var lastItemId: Int?
    public var lastPollId: Int?
    public var lastUserId: String?
    
    public init() {}
    
    public func fetchFeed(feedType: String, page: Int) async throws -> [Story] {
        fetchFeedCallCount += 1
        lastFeedType = feedType
        lastPage = page
        
        switch feedResult {
        case .success(let stories):
            return stories
        case .failure(let error):
            throw error
        }
    }
    
    public func fetchItemContent(id: Int) async throws -> Story {
        fetchItemContentCallCount += 1
        lastItemId = id
        
        guard let result = itemResult else {
            throw HackerNewsError.noData
        }
        
        switch result {
        case .success(let story):
            return story
        case .failure(let error):
            throw error
        }
    }
    
    public func fetchPollContent(id: Int) async throws -> PollResult {
        fetchPollContentCallCount += 1
        lastPollId = id
        
        guard let result = pollResult else {
            throw HackerNewsError.noData
        }
        
        switch result {
        case .success(let poll):
            return poll
        case .failure(let error):
            throw error
        }
    }
    
    public func fetchUser(id: String) async throws -> User {
        fetchUserCallCount += 1
        lastUserId = id
        
        guard let result = userResult else {
            throw HackerNewsError.noData
        }
        
        switch result {
        case .success(let user):
            return user
        case .failure(let error):
            throw error
        }
    }
}
