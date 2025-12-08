import Foundation

/// Represents the type of content on Hacker News
public enum FeedType: String, Codable, CaseIterable, Sendable {
    case poll
    case story
    case job
}
