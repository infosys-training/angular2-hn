import Foundation

struct Story: Codable, Identifiable, Equatable {
    let id: Int
    let title: String?
    let points: Int?
    let user: String?
    let time: Int?
    let timeAgo: String?
    let type: String?
    let url: String?
    let domain: String?
    let comments: [Comment]?
    let commentsCount: Int?
    let poll: [PollResult]?
    var pollVotesCount: Int?
    let deleted: Bool?
    let dead: Bool?
    
    enum CodingKeys: String, CodingKey {
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
    }
    
    static func == (lhs: Story, rhs: Story) -> Bool {
        return lhs.id == rhs.id
    }
}

extension Story {
    static var placeholder: Story {
        Story(
            id: 0,
            title: "Loading...",
            points: 0,
            user: "",
            time: 0,
            timeAgo: "",
            type: "story",
            url: nil,
            domain: nil,
            comments: nil,
            commentsCount: 0,
            poll: nil,
            pollVotesCount: nil,
            deleted: false,
            dead: false
        )
    }
}
