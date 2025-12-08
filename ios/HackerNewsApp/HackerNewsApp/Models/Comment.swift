import Foundation

struct Comment: Codable, Identifiable, Equatable {
    let id: Int
    let level: Int?
    let user: String?
    let time: Int?
    let timeAgo: String?
    let content: String?
    let deleted: Bool?
    let comments: [Comment]?
    
    enum CodingKeys: String, CodingKey {
        case id
        case level
        case user
        case time
        case timeAgo = "time_ago"
        case content
        case deleted
        case comments
    }
    
    static func == (lhs: Comment, rhs: Comment) -> Bool {
        return lhs.id == rhs.id
    }
}

extension Comment {
    var hasReplies: Bool {
        guard let comments = comments else { return false }
        return !comments.isEmpty
    }
    
    var replyCount: Int {
        guard let comments = comments else { return 0 }
        return comments.count + comments.reduce(0) { $0 + $1.replyCount }
    }
}
