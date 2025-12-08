import Foundation

struct User: Codable, Identifiable, Equatable {
    let id: String
    let createdTime: Int?
    let created: String?
    let karma: Int?
    let avg: Double?
    let about: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case createdTime = "crated_time"
        case created
        case karma
        case avg
        case about
    }
    
    static func == (lhs: User, rhs: User) -> Bool {
        return lhs.id == rhs.id
    }
}

extension User {
    static var placeholder: User {
        User(
            id: "",
            createdTime: nil,
            created: nil,
            karma: nil,
            avg: nil,
            about: nil
        )
    }
}
