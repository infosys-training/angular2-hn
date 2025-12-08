import Foundation

enum FeedType: String, CaseIterable, Identifiable {
    case news = "news"
    case newest = "newest"
    case ask = "ask"
    case show = "show"
    case jobs = "jobs"
    
    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .news: return "Top"
        case .newest: return "New"
        case .ask: return "Ask"
        case .show: return "Show"
        case .jobs: return "Jobs"
        }
    }
    
    var iconName: String {
        switch self {
        case .news: return "flame.fill"
        case .newest: return "clock.fill"
        case .ask: return "questionmark.circle.fill"
        case .show: return "eye.fill"
        case .jobs: return "briefcase.fill"
        }
    }
}
