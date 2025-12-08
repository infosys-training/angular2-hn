import XCTest
@testable import HackerNewsDataLayer

/// Tests for poll aggregation logic
final class PollAggregationTests: XCTestCase {
    
    // MARK: - Poll Vote Count Aggregation Tests
    
    func testPollVotesCountAggregation() {
        let pollOptions = [
            PollResult(points: 50, content: "Option A"),
            PollResult(points: 30, content: "Option B"),
            PollResult(points: 20, content: "Option C")
        ]
        
        let totalVotes = pollOptions.reduce(0) { $0 + $1.points }
        
        XCTAssertEqual(totalVotes, 100)
    }
    
    func testPollVotesCountWithEmptyPoll() {
        let pollOptions: [PollResult] = []
        
        let totalVotes = pollOptions.reduce(0) { $0 + $1.points }
        
        XCTAssertEqual(totalVotes, 0)
    }
    
    func testPollVotesCountWithSingleOption() {
        let pollOptions = [
            PollResult(points: 42, content: "Only Option")
        ]
        
        let totalVotes = pollOptions.reduce(0) { $0 + $1.points }
        
        XCTAssertEqual(totalVotes, 42)
    }
    
    func testPollVotesCountWithZeroVotes() {
        let pollOptions = [
            PollResult(points: 0, content: "Option A"),
            PollResult(points: 0, content: "Option B"),
            PollResult(points: 0, content: "Option C")
        ]
        
        let totalVotes = pollOptions.reduce(0) { $0 + $1.points }
        
        XCTAssertEqual(totalVotes, 0)
    }
    
    func testPollVotesCountWithLargeNumbers() {
        let pollOptions = [
            PollResult(points: 10000, content: "Popular Option"),
            PollResult(points: 5000, content: "Medium Option"),
            PollResult(points: 1000, content: "Less Popular Option")
        ]
        
        let totalVotes = pollOptions.reduce(0) { $0 + $1.points }
        
        XCTAssertEqual(totalVotes, 16000)
    }
    
    // MARK: - Poll Story Tests
    
    func testPollStoryWithOptions() {
        var story = Story(
            id: 99999,
            title: "Poll: What is your favorite language?",
            points: 200,
            user: "pollster",
            time: 1609459200,
            timeAgo: "1 day ago",
            type: .poll,
            url: nil,
            domain: nil,
            comments: [],
            commentsCount: 25,
            poll: [
                PollResult(points: 50, content: "Swift"),
                PollResult(points: 30, content: "Kotlin"),
                PollResult(points: 20, content: "Rust")
            ],
            pollVotesCount: 0,
            deleted: false,
            dead: false,
            content: nil
        )
        
        let aggregatedVotes = story.poll.reduce(0) { $0 + $1.points }
        story.pollVotesCount = aggregatedVotes
        
        XCTAssertEqual(story.pollVotesCount, 100)
        XCTAssertEqual(story.type, .poll)
        XCTAssertEqual(story.poll.count, 3)
    }
    
    func testPollOptionIndexCalculation() {
        let storyId = 100
        let numberOfPollOptions = 3
        
        var pollOptionIds: [Int] = []
        for i in 1...numberOfPollOptions {
            pollOptionIds.append(storyId + i)
        }
        
        XCTAssertEqual(pollOptionIds, [101, 102, 103])
    }
    
    func testPollOptionIndexCalculationWithDifferentStoryId() {
        let storyId = 12345
        let numberOfPollOptions = 5
        
        var pollOptionIds: [Int] = []
        for i in 1...numberOfPollOptions {
            pollOptionIds.append(storyId + i)
        }
        
        XCTAssertEqual(pollOptionIds, [12346, 12347, 12348, 12349, 12350])
    }
    
    // MARK: - Poll Result Ordering Tests
    
    func testPollResultsPreserveOrder() {
        let pollOptions = [
            PollResult(points: 10, content: "First"),
            PollResult(points: 20, content: "Second"),
            PollResult(points: 30, content: "Third")
        ]
        
        XCTAssertEqual(pollOptions[0].content, "First")
        XCTAssertEqual(pollOptions[1].content, "Second")
        XCTAssertEqual(pollOptions[2].content, "Third")
    }
    
    func testPollResultsSortedByVotes() {
        var pollOptions = [
            PollResult(points: 10, content: "Least Popular"),
            PollResult(points: 30, content: "Most Popular"),
            PollResult(points: 20, content: "Medium Popular")
        ]
        
        pollOptions.sort { $0.points > $1.points }
        
        XCTAssertEqual(pollOptions[0].content, "Most Popular")
        XCTAssertEqual(pollOptions[1].content, "Medium Popular")
        XCTAssertEqual(pollOptions[2].content, "Least Popular")
    }
    
    // MARK: - Poll Percentage Calculation Tests
    
    func testPollPercentageCalculation() {
        let pollOptions = [
            PollResult(points: 50, content: "Option A"),
            PollResult(points: 30, content: "Option B"),
            PollResult(points: 20, content: "Option C")
        ]
        
        let totalVotes = pollOptions.reduce(0) { $0 + $1.points }
        
        let percentages = pollOptions.map { option -> Double in
            guard totalVotes > 0 else { return 0 }
            return Double(option.points) / Double(totalVotes) * 100
        }
        
        XCTAssertEqual(percentages[0], 50.0, accuracy: 0.01)
        XCTAssertEqual(percentages[1], 30.0, accuracy: 0.01)
        XCTAssertEqual(percentages[2], 20.0, accuracy: 0.01)
    }
    
    func testPollPercentageCalculationWithZeroTotal() {
        let pollOptions = [
            PollResult(points: 0, content: "Option A"),
            PollResult(points: 0, content: "Option B")
        ]
        
        let totalVotes = pollOptions.reduce(0) { $0 + $1.points }
        
        let percentages = pollOptions.map { option -> Double in
            guard totalVotes > 0 else { return 0 }
            return Double(option.points) / Double(totalVotes) * 100
        }
        
        XCTAssertEqual(percentages[0], 0.0)
        XCTAssertEqual(percentages[1], 0.0)
    }
    
    // MARK: - Mock API Client Poll Tests
    
    func testMockClientPollFetching() async throws {
        let mockClient = MockHackerNewsAPIClient()
        let expectedPollResult = PollResult(points: 42, content: "Test Option")
        
        mockClient.pollResult = .success(expectedPollResult)
        
        let result = try await mockClient.fetchPollContent(id: 12346)
        
        XCTAssertEqual(result.points, 42)
        XCTAssertEqual(result.content, "Test Option")
        XCTAssertEqual(mockClient.fetchPollContentCallCount, 1)
        XCTAssertEqual(mockClient.lastPollId, 12346)
    }
    
    func testMockClientPollFetchingError() async {
        let mockClient = MockHackerNewsAPIClient()
        mockClient.pollResult = .failure(HackerNewsError.serverError(statusCode: 404))
        
        do {
            _ = try await mockClient.fetchPollContent(id: 99999)
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
    
    // MARK: - Integration-style Poll Tests
    
    func testPollStoryAggregationFlow() {
        var story = Story(
            id: 1000,
            title: "Test Poll",
            points: nil,
            user: "pollster",
            time: 1609459200,
            timeAgo: "1 hour ago",
            type: .poll,
            url: nil,
            domain: nil,
            comments: [],
            commentsCount: 0,
            poll: [
                PollResult(points: 0, content: "Placeholder 1"),
                PollResult(points: 0, content: "Placeholder 2"),
                PollResult(points: 0, content: "Placeholder 3")
            ],
            pollVotesCount: 0,
            deleted: nil,
            dead: nil,
            content: nil
        )
        
        let fetchedPollResults = [
            PollResult(points: 100, content: "Option A"),
            PollResult(points: 75, content: "Option B"),
            PollResult(points: 25, content: "Option C")
        ]
        
        story.poll = fetchedPollResults
        story.pollVotesCount = fetchedPollResults.reduce(0) { $0 + $1.points }
        
        XCTAssertEqual(story.poll.count, 3)
        XCTAssertEqual(story.poll[0].points, 100)
        XCTAssertEqual(story.poll[1].points, 75)
        XCTAssertEqual(story.poll[2].points, 25)
        XCTAssertEqual(story.pollVotesCount, 200)
    }
    
    func testNonPollStoryHasEmptyPoll() {
        let story = Story(
            id: 12345,
            title: "Regular Story",
            points: 100,
            user: "author",
            time: 1609459200,
            timeAgo: "3 hours ago",
            type: .story,
            url: "https://example.com",
            domain: "example.com",
            comments: [],
            commentsCount: 50,
            poll: [],
            pollVotesCount: 0,
            deleted: false,
            dead: false,
            content: nil
        )
        
        XCTAssertEqual(story.type, .story)
        XCTAssertTrue(story.poll.isEmpty)
        XCTAssertEqual(story.pollVotesCount, 0)
    }
}
