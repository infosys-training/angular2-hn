//
//  Settings.swift
//  HackerNews
//
//  iOS equivalent of Angular settings.ts model
//  Migrated from: src/app/shared/models/settings.ts
//

import Foundation

/// Theme options available in the application
enum AppTheme: String, CaseIterable, Codable {
    case `default` = "default"
    case night = "night"
    case amoledblack = "amoledblack"
    
    var displayName: String {
        switch self {
        case .default:
            return "Default"
        case .night:
            return "Night"
        case .amoledblack:
            return "Black (AMOLED)"
        }
    }
}

/// Settings model that mirrors the Angular Settings interface
/// Replaces: src/app/shared/models/settings.ts
struct Settings: Codable, Equatable {
    /// Whether to open links in Safari instead of in-app browser
    /// iOS equivalent of Angular's `openLinkInNewTab`
    var openLinkInSafari: Bool
    
    /// Current theme selection
    var theme: AppTheme
    
    /// Font size for story titles
    var titleFontSize: String
    
    /// Spacing between list items
    var listSpacing: String
    
    /// Whether the user has manually selected a theme (overrides system preference)
    var hasManualThemeOverride: Bool
    
    /// Default settings values
    static let defaultSettings = Settings(
        openLinkInSafari: false,
        theme: .default,
        titleFontSize: "16",
        listSpacing: "0",
        hasManualThemeOverride: false
    )
    
    /// Computed property to get title font size as CGFloat
    var titleFontSizeValue: CGFloat {
        CGFloat(Double(titleFontSize) ?? 16.0)
    }
    
    /// Computed property to get list spacing as CGFloat
    var listSpacingValue: CGFloat {
        CGFloat(Double(listSpacing) ?? 0.0)
    }
}
