import Foundation

/// Represents a poll option result from Hacker News
public struct PollResult: Codable, Equatable, Sendable {
    public let points: Int
    public let content: String
    
    public init(points: Int, content: String) {
        self.points = points
        self.content = content
    }
}
