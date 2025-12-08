import Foundation

/// Represents a comment on Hacker News with recursive nested comments
public struct Comment: Codable, Equatable, Sendable {
    public let id: Int
    public let level: Int
    public let user: String?
    public let time: Int
    public let timeAgo: String
    public let content: String?
    public let deleted: Bool?
    public let comments: [Comment]
    
    public init(
        id: Int,
        level: Int,
        user: String?,
        time: Int,
        timeAgo: String,
        content: String?,
        deleted: Bool?,
        comments: [Comment]
    ) {
        self.id = id
        self.level = level
        self.user = user
        self.time = time
        self.timeAgo = timeAgo
        self.content = content
        self.deleted = deleted
        self.comments = comments
    }
    
    private enum CodingKeys: String, CodingKey {
        case id
        case level
        case user
        case time
        case timeAgo = "time_ago"
        case content
        case deleted
        case comments
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        level = try container.decodeIfPresent(Int.self, forKey: .level) ?? 0
        user = try container.decodeIfPresent(String.self, forKey: .user)
        time = try container.decodeIfPresent(Int.self, forKey: .time) ?? 0
        timeAgo = try container.decodeIfPresent(String.self, forKey: .timeAgo) ?? ""
        content = try container.decodeIfPresent(String.self, forKey: .content)
        deleted = try container.decodeIfPresent(Bool.self, forKey: .deleted)
        comments = try container.decodeIfPresent([Comment].self, forKey: .comments) ?? []
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(level, forKey: .level)
        try container.encodeIfPresent(user, forKey: .user)
        try container.encode(time, forKey: .time)
        try container.encode(timeAgo, forKey: .timeAgo)
        try container.encodeIfPresent(content, forKey: .content)
        try container.encodeIfPresent(deleted, forKey: .deleted)
        try container.encode(comments, forKey: .comments)
    }
}
