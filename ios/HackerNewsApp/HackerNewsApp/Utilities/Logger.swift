import Foundation
import os.log

struct Logger {
    private static let subsystem = Bundle.main.bundleIdentifier ?? "com.angular2hn.ios"
    
    static let api = os.Logger(subsystem: subsystem, category: "API")
    static let ui = os.Logger(subsystem: subsystem, category: "UI")
    static let data = os.Logger(subsystem: subsystem, category: "Data")
    static let general = os.Logger(subsystem: subsystem, category: "General")
    
    static func log(_ message: String, type: OSLogType = .default, category: os.Logger = general) {
        category.log(level: type, "\(message)")
    }
    
    static func debug(_ message: String, category: os.Logger = general) {
        category.debug("\(message)")
    }
    
    static func info(_ message: String, category: os.Logger = general) {
        category.info("\(message)")
    }
    
    static func warning(_ message: String, category: os.Logger = general) {
        category.warning("\(message)")
    }
    
    static func error(_ message: String, category: os.Logger = general) {
        category.error("\(message)")
    }
    
    static func fault(_ message: String, category: os.Logger = general) {
        category.fault("\(message)")
    }
}
