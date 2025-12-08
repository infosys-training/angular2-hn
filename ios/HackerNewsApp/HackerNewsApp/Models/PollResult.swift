import Foundation

struct PollResult: Codable, Identifiable, Equatable {
    let id: Int
    let title: String?
    let points: Int?
    
    static func == (lhs: PollResult, rhs: PollResult) -> Bool {
        return lhs.id == rhs.id
    }
}
