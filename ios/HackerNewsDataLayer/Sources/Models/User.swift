import Foundation

/// Represents a Hacker News user profile
public struct User: Codable, Equatable, Sendable {
    public let id: String
    public let cratedTime: Int?
    public let created: String?
    public let karma: Int
    public let avg: Double?
    public let about: String?
    
    public init(
        id: String,
        cratedTime: Int?,
        created: String?,
        karma: Int,
        avg: Double?,
        about: String?
    ) {
        self.id = id
        self.cratedTime = cratedTime
        self.created = created
        self.karma = karma
        self.avg = avg
        self.about = about
    }
    
    private enum CodingKeys: String, CodingKey {
        case id
        case cratedTime = "crated_time"
        case created
        case karma
        case avg
        case about
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        cratedTime = try container.decodeIfPresent(Int.self, forKey: .cratedTime)
        created = try container.decodeIfPresent(String.self, forKey: .created)
        karma = try container.decodeIfPresent(Int.self, forKey: .karma) ?? 0
        avg = try container.decodeIfPresent(Double.self, forKey: .avg)
        about = try container.decodeIfPresent(String.self, forKey: .about)
    }
}
