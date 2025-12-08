import XCTest
@testable import HackerNewsDataLayer

/// Tests for model decoding from JSON responses
final class ModelDecodingTests: XCTestCase {
    
    // MARK: - FeedType Tests
    
    func testFeedTypeDecoding() throws {
        let pollJSON = "\"poll\""
        let storyJSON = "\"story\""
        let jobJSON = "\"job\""
        
        let decoder = JSONDecoder()
        
        let poll = try decoder.decode(FeedType.self, from: pollJSON.data(using: .utf8)!)
        let story = try decoder.decode(FeedType.self, from: storyJSON.data(using: .utf8)!)
        let job = try decoder.decode(FeedType.self, from: jobJSON.data(using: .utf8)!)
        
        XCTAssertEqual(poll, .poll)
        XCTAssertEqual(story, .story)
        XCTAssertEqual(job, .job)
    }
    
    func testFeedTypeEncoding() throws {
        let encoder = JSONEncoder()
        
        let pollData = try encoder.encode(FeedType.poll)
        let storyData = try encoder.encode(FeedType.story)
        let jobData = try encoder.encode(FeedType.job)
        
        XCTAssertEqual(String(data: pollData, encoding: .utf8), "\"poll\"")
        XCTAssertEqual(String(data: storyData, encoding: .utf8), "\"story\"")
        XCTAssertEqual(String(data: jobData, encoding: .utf8), "\"job\"")
    }
    
    // MARK: - PollResult Tests
    
    func testPollResultDecoding() throws {
        let json = """
        {
            "points": 42,
            "content": "Option A"
        }
        """
        
        let decoder = JSONDecoder()
        let pollResult = try decoder.decode(PollResult.self, from: json.data(using: .utf8)!)
        
        XCTAssertEqual(pollResult.points, 42)
        XCTAssertEqual(pollResult.content, "Option A")
    }
    
    func testPollResultEncoding() throws {
        let pollResult = PollResult(points: 100, content: "Test Option")
        
        let encoder = JSONEncoder()
        let data = try encoder.encode(pollResult)
        
        let decoder = JSONDecoder()
        let decoded = try decoder.decode(PollResult.self, from: data)
        
        XCTAssertEqual(decoded, pollResult)
    }
    
    // MARK: - Comment Tests
    
    func testCommentDecoding() throws {
        let json = """
        {
            "id": 12345,
            "level": 0,
            "user": "testuser",
            "time": 1609459200,
            "time_ago": "2 hours ago",
            "content": "This is a test comment",
            "deleted": false,
            "comments": []
        }
        """
        
        let decoder = JSONDecoder()
        let comment = try decoder.decode(Comment.self, from: json.data(using: .utf8)!)
        
        XCTAssertEqual(comment.id, 12345)
        XCTAssertEqual(comment.level, 0)
        XCTAssertEqual(comment.user, "testuser")
        XCTAssertEqual(comment.time, 1609459200)
        XCTAssertEqual(comment.timeAgo, "2 hours ago")
        XCTAssertEqual(comment.content, "This is a test comment")
        XCTAssertEqual(comment.deleted, false)
        XCTAssertTrue(comment.comments.isEmpty)
    }
    
    func testCommentDecodingWithNestedComments() throws {
        let json = """
        {
            "id": 1,
            "level": 0,
            "user": "parent",
            "time": 1609459200,
            "time_ago": "1 hour ago",
            "content": "Parent comment",
            "comments": [
                {
                    "id": 2,
                    "level": 1,
                    "user": "child",
                    "time": 1609459300,
                    "time_ago": "30 minutes ago",
                    "content": "Child comment",
                    "comments": [
                        {
                            "id": 3,
                            "level": 2,
                            "user": "grandchild",
                            "time": 1609459400,
                            "time_ago": "10 minutes ago",
                            "content": "Grandchild comment",
                            "comments": []
                        }
                    ]
                }
            ]
        }
        """
        
        let decoder = JSONDecoder()
        let comment = try decoder.decode(Comment.self, from: json.data(using: .utf8)!)
        
        XCTAssertEqual(comment.id, 1)
        XCTAssertEqual(comment.comments.count, 1)
        
        let childComment = comment.comments[0]
        XCTAssertEqual(childComment.id, 2)
        XCTAssertEqual(childComment.level, 1)
        XCTAssertEqual(childComment.comments.count, 1)
        
        let grandchildComment = childComment.comments[0]
        XCTAssertEqual(grandchildComment.id, 3)
        XCTAssertEqual(grandchildComment.level, 2)
        XCTAssertTrue(grandchildComment.comments.isEmpty)
    }
    
    func testCommentDecodingWithMissingOptionalFields() throws {
        let json = """
        {
            "id": 99999
        }
        """
        
        let decoder = JSONDecoder()
        let comment = try decoder.decode(Comment.self, from: json.data(using: .utf8)!)
        
        XCTAssertEqual(comment.id, 99999)
        XCTAssertEqual(comment.level, 0)
        XCTAssertNil(comment.user)
        XCTAssertEqual(comment.time, 0)
        XCTAssertEqual(comment.timeAgo, "")
        XCTAssertNil(comment.content)
        XCTAssertNil(comment.deleted)
        XCTAssertTrue(comment.comments.isEmpty)
    }
    
    func testDeletedCommentDecoding() throws {
        let json = """
        {
            "id": 12345,
            "level": 1,
            "deleted": true,
            "comments": []
        }
        """
        
        let decoder = JSONDecoder()
        let comment = try decoder.decode(Comment.self, from: json.data(using: .utf8)!)
        
        XCTAssertEqual(comment.id, 12345)
        XCTAssertEqual(comment.deleted, true)
        XCTAssertNil(comment.user)
        XCTAssertNil(comment.content)
    }
    
    // MARK: - User Tests
    
    func testUserDecoding() throws {
        let json = """
        {
            "id": "testuser",
            "crated_time": 1234567890,
            "created": "10 years ago",
            "karma": 5000,
            "avg": 12.5,
            "about": "I am a test user"
        }
        """
        
        let decoder = JSONDecoder()
        let user = try decoder.decode(User.self, from: json.data(using: .utf8)!)
        
        XCTAssertEqual(user.id, "testuser")
        XCTAssertEqual(user.cratedTime, 1234567890)
        XCTAssertEqual(user.created, "10 years ago")
        XCTAssertEqual(user.karma, 5000)
        XCTAssertEqual(user.avg, 12.5)
        XCTAssertEqual(user.about, "I am a test user")
    }
    
    func testUserDecodingWithMissingOptionalFields() throws {
        let json = """
        {
            "id": "minimaluser"
        }
        """
        
        let decoder = JSONDecoder()
        let user = try decoder.decode(User.self, from: json.data(using: .utf8)!)
        
        XCTAssertEqual(user.id, "minimaluser")
        XCTAssertNil(user.cratedTime)
        XCTAssertNil(user.created)
        XCTAssertEqual(user.karma, 0)
        XCTAssertNil(user.avg)
        XCTAssertNil(user.about)
    }
    
    // MARK: - Story Tests
    
    func testStoryDecoding() throws {
        let json = """
        {
            "id": 12345,
            "title": "Test Story",
            "points": 100,
            "user": "author",
            "time": 1609459200,
            "time_ago": "3 hours ago",
            "type": "story",
            "url": "https://example.com",
            "domain": "example.com",
            "comments": [],
            "comments_count": 50,
            "deleted": false,
            "dead": false
        }
        """
        
        let decoder = JSONDecoder()
        let story = try decoder.decode(Story.self, from: json.data(using: .utf8)!)
        
        XCTAssertEqual(story.id, 12345)
        XCTAssertEqual(story.title, "Test Story")
        XCTAssertEqual(story.points, 100)
        XCTAssertEqual(story.user, "author")
        XCTAssertEqual(story.time, 1609459200)
        XCTAssertEqual(story.timeAgo, "3 hours ago")
        XCTAssertEqual(story.type, .story)
        XCTAssertEqual(story.url, "https://example.com")
        XCTAssertEqual(story.domain, "example.com")
        XCTAssertTrue(story.comments.isEmpty)
        XCTAssertEqual(story.commentsCount, 50)
        XCTAssertEqual(story.deleted, false)
        XCTAssertEqual(story.dead, false)
    }
    
    func testPollStoryDecoding() throws {
        let json = """
        {
            "id": 99999,
            "title": "Poll: What is your favorite language?",
            "points": 200,
            "user": "pollster",
            "time": 1609459200,
            "time_ago": "1 day ago",
            "type": "poll",
            "comments": [],
            "comments_count": 25,
            "poll": [
                {"points": 50, "content": "Swift"},
                {"points": 30, "content": "Kotlin"},
                {"points": 20, "content": "Rust"}
            ],
            "poll_votes_count": 100
        }
        """
        
        let decoder = JSONDecoder()
        let story = try decoder.decode(Story.self, from: json.data(using: .utf8)!)
        
        XCTAssertEqual(story.id, 99999)
        XCTAssertEqual(story.type, .poll)
        XCTAssertEqual(story.poll.count, 3)
        XCTAssertEqual(story.poll[0].content, "Swift")
        XCTAssertEqual(story.poll[0].points, 50)
        XCTAssertEqual(story.pollVotesCount, 100)
    }
    
    func testStoryDecodingWithComments() throws {
        let json = """
        {
            "id": 12345,
            "title": "Story with comments",
            "type": "story",
            "comments": [
                {
                    "id": 1,
                    "level": 0,
                    "user": "commenter1",
                    "time": 1609459200,
                    "time_ago": "1 hour ago",
                    "content": "First comment",
                    "comments": []
                },
                {
                    "id": 2,
                    "level": 0,
                    "user": "commenter2",
                    "time": 1609459300,
                    "time_ago": "30 minutes ago",
                    "content": "Second comment",
                    "comments": []
                }
            ],
            "comments_count": 2
        }
        """
        
        let decoder = JSONDecoder()
        let story = try decoder.decode(Story.self, from: json.data(using: .utf8)!)
        
        XCTAssertEqual(story.comments.count, 2)
        XCTAssertEqual(story.comments[0].user, "commenter1")
        XCTAssertEqual(story.comments[1].user, "commenter2")
    }
    
    func testStoryDecodingWithMissingOptionalFields() throws {
        let json = """
        {
            "id": 12345
        }
        """
        
        let decoder = JSONDecoder()
        let story = try decoder.decode(Story.self, from: json.data(using: .utf8)!)
        
        XCTAssertEqual(story.id, 12345)
        XCTAssertNil(story.title)
        XCTAssertNil(story.points)
        XCTAssertNil(story.user)
        XCTAssertEqual(story.time, 0)
        XCTAssertNil(story.type)
        XCTAssertNil(story.url)
        XCTAssertNil(story.domain)
        XCTAssertTrue(story.comments.isEmpty)
        XCTAssertEqual(story.commentsCount, 0)
        XCTAssertTrue(story.poll.isEmpty)
        XCTAssertEqual(story.pollVotesCount, 0)
    }
    
    func testJobStoryDecoding() throws {
        let json = """
        {
            "id": 55555,
            "title": "Software Engineer at Example Corp",
            "time": 1609459200,
            "time_ago": "2 days ago",
            "type": "job",
            "url": "https://example.com/jobs/123",
            "domain": "example.com"
        }
        """
        
        let decoder = JSONDecoder()
        let story = try decoder.decode(Story.self, from: json.data(using: .utf8)!)
        
        XCTAssertEqual(story.id, 55555)
        XCTAssertEqual(story.type, .job)
        XCTAssertEqual(story.title, "Software Engineer at Example Corp")
    }
    
    // MARK: - Story Array Decoding Tests
    
    func testStoryArrayDecoding() throws {
        let json = """
        [
            {
                "id": 1,
                "title": "First Story",
                "type": "story"
            },
            {
                "id": 2,
                "title": "Second Story",
                "type": "story"
            },
            {
                "id": 3,
                "title": "Third Story",
                "type": "job"
            }
        ]
        """
        
        let decoder = JSONDecoder()
        let stories = try decoder.decode([Story].self, from: json.data(using: .utf8)!)
        
        XCTAssertEqual(stories.count, 3)
        XCTAssertEqual(stories[0].id, 1)
        XCTAssertEqual(stories[1].id, 2)
        XCTAssertEqual(stories[2].type, .job)
    }
    
    // MARK: - Encoding Tests
    
    func testStoryEncoding() throws {
        let story = Story(
            id: 12345,
            title: "Test Story",
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
        
        let encoder = JSONEncoder()
        let data = try encoder.encode(story)
        
        let decoder = JSONDecoder()
        let decoded = try decoder.decode(Story.self, from: data)
        
        XCTAssertEqual(decoded.id, story.id)
        XCTAssertEqual(decoded.title, story.title)
        XCTAssertEqual(decoded.points, story.points)
    }
    
    func testCommentEncoding() throws {
        let comment = Comment(
            id: 12345,
            level: 0,
            user: "testuser",
            time: 1609459200,
            timeAgo: "2 hours ago",
            content: "Test comment",
            deleted: false,
            comments: []
        )
        
        let encoder = JSONEncoder()
        let data = try encoder.encode(comment)
        
        let decoder = JSONDecoder()
        let decoded = try decoder.decode(Comment.self, from: data)
        
        XCTAssertEqual(decoded.id, comment.id)
        XCTAssertEqual(decoded.user, comment.user)
        XCTAssertEqual(decoded.content, comment.content)
    }
}
