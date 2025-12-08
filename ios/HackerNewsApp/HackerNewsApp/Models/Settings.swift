import Foundation
import SwiftUI

struct Settings: Codable, Equatable {
    var showSettings: Bool
    var openLinkInNewTab: Bool
    var theme: Theme
    var titleFontSize: CGFloat
    var listSpacing: CGFloat
    
    init(
        showSettings: Bool = false,
        openLinkInNewTab: Bool = false,
        theme: Theme = .system,
        titleFontSize: CGFloat = 16,
        listSpacing: CGFloat = 0
    ) {
        self.showSettings = showSettings
        self.openLinkInNewTab = openLinkInNewTab
        self.theme = theme
        self.titleFontSize = titleFontSize
        self.listSpacing = listSpacing
    }
}

enum Theme: String, Codable, CaseIterable {
    case light = "default"
    case dark = "night"
    case system = "system"
    
    var displayName: String {
        switch self {
        case .light: return "Light"
        case .dark: return "Dark"
        case .system: return "System"
        }
    }
    
    var colorScheme: ColorScheme? {
        switch self {
        case .light: return .light
        case .dark: return .dark
        case .system: return nil
        }
    }
}
