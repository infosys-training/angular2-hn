import Foundation

/// Represents a story/item from Hacker News
public struct Story: Codable, Equatable, Sendable {
    public let id: Int
    public let title: String?
    public let points: Int?
    public let user: String?
    public let time: Int
    public let timeAgo: String?
    public let type: FeedType?
    public let url: String?
    public let domain: String?
    public let comments: [Comment]
    public let commentsCount: Int
    public var poll: [PollResult]
    public var pollVotesCount: Int
    public let deleted: Bool?
    public let dead: Bool?
    public let content: String?
    
    public init(
        id: Int,
        title: String?,
        points: Int?,
        user: String?,
        time: Int,
        timeAgo: String?,
        type: FeedType?,
        url: String?,
        domain: String?,
        comments: [Comment],
        commentsCount: Int,
        poll: [PollResult],
        pollVotesCount: Int,
        deleted: Bool?,
        dead: Bool?,
        content: String?
    ) {
        self.id = id
        self.title = title
        self.points = points
        self.user = user
        self.time = time
        self.timeAgo = timeAgo
        self.type = type
        self.url = url
        self.domain = domain
        self.comments = comments
        self.commentsCount = commentsCount
        self.poll = poll
        self.pollVotesCount = pollVotesCount
        self.deleted = deleted
        self.dead = dead
        self.content = content
    }
    
    private enum CodingKeys: String, CodingKey {
        case id
        case title
        case points
        case user
        case time
        case timeAgo = "time_ago"
        case type
        case url
        case domain
        case comments
        case commentsCount = "comments_count"
        case poll
        case pollVotesCount = "poll_votes_count"
        case deleted
        case dead
        case content
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        title = try container.decodeIfPresent(String.self, forKey: .title)
        points = try container.decodeIfPresent(Int.self, forKey: .points)
        user = try container.decodeIfPresent(String.self, forKey: .user)
        time = try container.decodeIfPresent(Int.self, forKey: .time) ?? 0
        timeAgo = try container.decodeIfPresent(String.self, forKey: .timeAgo)
        type = try container.decodeIfPresent(FeedType.self, forKey: .type)
        url = try container.decodeIfPresent(String.self, forKey: .url)
        domain = try container.decodeIfPresent(String.self, forKey: .domain)
        comments = try container.decodeIfPresent([Comment].self, forKey: .comments) ?? []
        commentsCount = try container.decodeIfPresent(Int.self, forKey: .commentsCount) ?? 0
        poll = try container.decodeIfPresent([PollResult].self, forKey: .poll) ?? []
        pollVotesCount = try container.decodeIfPresent(Int.self, forKey: .pollVotesCount) ?? 0
        deleted = try container.decodeIfPresent(Bool.self, forKey: .deleted)
        dead = try container.decodeIfPresent(Bool.self, forKey: .dead)
        content = try container.decodeIfPresent(String.self, forKey: .content)
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encodeIfPresent(title, forKey: .title)
        try container.encodeIfPresent(points, forKey: .points)
        try container.encodeIfPresent(user, forKey: .user)
        try container.encode(time, forKey: .time)
        try container.encodeIfPresent(timeAgo, forKey: .timeAgo)
        try container.encodeIfPresent(type, forKey: .type)
        try container.encodeIfPresent(url, forKey: .url)
        try container.encodeIfPresent(domain, forKey: .domain)
        try container.encode(comments, forKey: .comments)
        try container.encode(commentsCount, forKey: .commentsCount)
        try container.encode(poll, forKey: .poll)
        try container.encode(pollVotesCount, forKey: .pollVotesCount)
        try container.encodeIfPresent(deleted, forKey: .deleted)
        try container.encodeIfPresent(dead, forKey: .dead)
        try container.encodeIfPresent(content, forKey: .content)
    }
}
