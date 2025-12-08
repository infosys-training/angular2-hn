import XCTest
@testable import HackerNewsDataLayer

/// Tests for the HackerNewsAPIClient using mock URLSession
final class HackerNewsAPIClientTests: XCTestCase {
    
    var mockClient: MockHackerNewsAPIClient!
    var repository: StoryRepository!
    
    override func setUp() {
        super.setUp()
        mockClient = MockHackerNewsAPIClient()
        repository = StoryRepository(apiClient: mockClient)
    }
    
    override func tearDown() {
        mockClient = nil
        repository = nil
        super.tearDown()
    }
    
    // MARK: - Feed Fetching Tests
    
    func testFetchFeedSuccess() async throws {
        let expectedStories = [
            Story(
                id: 1,
                title: "Test Story 1",
                points: 100,
                user: "user1",
                time: 1609459200,
                timeAgo: "1 hour ago",
                type: .story,
                url: "https://example.com/1",
                domain: "example.com",
                comments: [],
                commentsCount: 10,
                poll: [],
                pollVotesCount: 0,
                deleted: false,
                dead: false,
                content: nil
            ),
            Story(
                id: 2,
                title: "Test Story 2",
                points: 50,
                user: "user2",
                time: 1609459300,
                timeAgo: "30 minutes ago",
                type: .story,
                url: "https://example.com/2",
                domain: "example.com",
                comments: [],
                commentsCount: 5,
                poll: [],
                pollVotesCount: 0,
                deleted: false,
                dead: false,
                content: nil
            )
        ]
        
        mockClient.feedResult = .success(expectedStories)
        
        let stories = try await repository.getStories(feedType: "news", page: 1)
        
        XCTAssertEqual(stories.count, 2)
        XCTAssertEqual(stories[0].id, 1)
        XCTAssertEqual(stories[1].id, 2)
        XCTAssertEqual(mockClient.fetchFeedCallCount, 1)
        XCTAssertEqual(mockClient.lastFeedType, "news")
        XCTAssertEqual(mockClient.lastPage, 1)
    }
    
    func testFetchFeedNetworkError() async {
        mockClient.feedResult = .failure(HackerNewsError.networkError("Connection failed"))
        
        do {
            _ = try await repository.getStories(feedType: "news", page: 1)
            XCTFail("Expected error to be thrown")
        } catch let error as HackerNewsError {
            if case .networkError(let message) = error {
                XCTAssertEqual(message, "Connection failed")
            } else {
                XCTFail("Expected network error")
            }
        } catch {
            XCTFail("Unexpected error type: \(error)")
        }
    }
    
    func testFetchFeedServerError() async {
        mockClient.feedResult = .failure(HackerNewsError.serverError(statusCode: 500))
        
        do {
            _ = try await repository.getStories(feedType: "news", page: 1)
            XCTFail("Expected error to be thrown")
        } catch let error as HackerNewsError {
            if case .serverError(let statusCode) = error {
                XCTAssertEqual(statusCode, 500)
            } else {
                XCTFail("Expected server error")
            }
        } catch {
            XCTFail("Unexpected error type: \(error)")
        }
    }
    
    func testFetchFeedDifferentFeedTypes() async throws {
        mockClient.feedResult = .success([])
        
        _ = try await repository.getTopStories(page: 1)
        XCTAssertEqual(mockClient.lastFeedType, "news")
        
        _ = try await repository.getNewestStories(page: 1)
        XCTAssertEqual(mockClient.lastFeedType, "newest")
        
        _ = try await repository.getAskStories(page: 1)
        XCTAssertEqual(mockClient.lastFeedType, "ask")
        
        _ = try await repository.getShowStories(page: 1)
        XCTAssertEqual(mockClient.lastFeedType, "show")
        
        _ = try await repository.getJobStories(page: 1)
        XCTAssertEqual(mockClient.lastFeedType, "jobs")
        
        XCTAssertEqual(mockClient.fetchFeedCallCount, 5)
    }
    
    // MARK: - Item Content Fetching Tests
    
    func testFetchItemContentSuccess() async throws {
        let expectedStory = Story(
            id: 12345,
            title: "Test Story",
            points: 100,
            user: "author",
            time: 1609459200,
            timeAgo: "3 hours ago",
            type: .story,
            url: "https://example.com",
            domain: "example.com",
            comments: [
                Comment(
                    id: 1,
                    level: 0,
                    user: "commenter",
                    time: 1609459300,
                    timeAgo: "2 hours ago",
                    content: "Great article!",
                    deleted: false,
                    comments: []
                )
            ],
            commentsCount: 1,
            poll: [],
            pollVotesCount: 0,
            deleted: false,
            dead: false,
            content: nil
        )
        
        mockClient.itemResult = .success(expectedStory)
        
        let story = try await repository.getStory(id: 12345)
        
        XCTAssertEqual(story.id, 12345)
        XCTAssertEqual(story.title, "Test Story")
        XCTAssertEqual(story.comments.count, 1)
        XCTAssertEqual(mockClient.fetchItemContentCallCount, 1)
        XCTAssertEqual(mockClient.lastItemId, 12345)
    }
    
    func testFetchItemContentNotFound() async {
        mockClient.itemResult = .failure(HackerNewsError.serverError(statusCode: 404))
        
        do {
            _ = try await repository.getStory(id: 99999)
            XCTFail("Expected error to be thrown")
        } catch let error as HackerNewsError {
            if case .serverError(let statusCode) = error {
                XCTAssertEqual(statusCode, 404)
            } else {
                XCTFail("Expected server error")
            }
        } catch {
            XCTFail("Unexpected error type: \(error)")
        }
    }
    
    // MARK: - User Fetching Tests
    
    func testFetchUserSuccess() async throws {
        let expectedUser = User(
            id: "testuser",
            cratedTime: 1234567890,
            created: "10 years ago",
            karma: 5000,
            avg: 12.5,
            about: "I am a test user"
        )
        
        mockClient.userResult = .success(expectedUser)
        
        let user = try await repository.getUser(id: "testuser")
        
        XCTAssertEqual(user.id, "testuser")
        XCTAssertEqual(user.karma, 5000)
        XCTAssertEqual(mockClient.fetchUserCallCount, 1)
        XCTAssertEqual(mockClient.lastUserId, "testuser")
    }
    
    func testFetchUserNotFound() async {
        mockClient.userResult = .failure(HackerNewsError.serverError(statusCode: 404))
        
        do {
            _ = try await repository.getUser(id: "nonexistent")
            XCTFail("Expected error to be thrown")
        } catch let error as HackerNewsError {
            if case .serverError(let statusCode) = error {
                XCTAssertEqual(statusCode, 404)
            } else {
                XCTFail("Expected server error")
            }
        } catch {
            XCTFail("Unexpected error type: \(error)")
        }
    }
    
    // MARK: - Error Type Tests
    
    func testErrorLocalizedDescriptions() {
        let errors: [HackerNewsError] = [
            .invalidURL,
            .networkError("Connection timeout"),
            .decodingError("Invalid JSON"),
            .serverError(statusCode: 503),
            .noData,
            .cancelled,
            .unknown("Something went wrong")
        ]
        
        for error in errors {
            XCTAssertFalse(error.localizedDescription.isEmpty)
        }
        
        XCTAssertTrue(HackerNewsError.invalidURL.localizedDescription.contains("invalid"))
        XCTAssertTrue(HackerNewsError.networkError("test").localizedDescription.contains("Network"))
        XCTAssertTrue(HackerNewsError.serverError(statusCode: 500).localizedDescription.contains("500"))
    }
    
    func testErrorRetryability() {
        XCTAssertFalse(HackerNewsError.invalidURL.isRetryable)
        XCTAssertTrue(HackerNewsError.networkError("test").isRetryable)
        XCTAssertFalse(HackerNewsError.decodingError("test").isRetryable)
        XCTAssertTrue(HackerNewsError.serverError(statusCode: 500).isRetryable)
        XCTAssertTrue(HackerNewsError.noData.isRetryable)
        XCTAssertFalse(HackerNewsError.cancelled.isRetryable)
        XCTAssertFalse(HackerNewsError.unknown("test").isRetryable)
    }
}
