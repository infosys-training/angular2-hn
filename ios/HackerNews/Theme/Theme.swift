//
//  Theme.swift
//  HackerNews
//
//  Theme system with color schemes for default, night, and amoledblack themes
//  Integrates with iOS dark mode using @Environment(\.colorScheme)
//

import SwiftUI

/// Color scheme definition for the application
struct ThemeColors {
    let background: Color
    let secondaryBackground: Color
    let text: Color
    let secondaryText: Color
    let accent: Color
    let separator: Color
    let cardBackground: Color
    
    /// Hacker News orange accent color (#FF6600)
    static let hackerNewsOrange = Color(red: 255/255, green: 102/255, blue: 0/255)
}

/// Theme manager that provides color schemes based on the selected theme
struct ThemeManager {
    
    /// Get the color scheme for a given theme
    /// - Parameter theme: The selected app theme
    /// - Returns: ThemeColors for the specified theme
    static func colors(for theme: AppTheme) -> ThemeColors {
        switch theme {
        case .default:
            return defaultTheme
        case .night:
            return nightTheme
        case .amoledblack:
            return amoledBlackTheme
        }
    }
    
    /// Default theme colors
    /// Background: .white / .systemBackground
    /// Text: .black / .label
    /// Accent: #FF6600 (Hacker News orange)
    static let defaultTheme = ThemeColors(
        background: Color(.systemBackground),
        secondaryBackground: Color(.secondarySystemBackground),
        text: Color(.label),
        secondaryText: Color(.secondaryLabel),
        accent: ThemeColors.hackerNewsOrange,
        separator: Color(.separator),
        cardBackground: Color(.systemBackground)
    )
    
    /// Night theme colors
    /// Background: #1a1a1a
    /// Text: #e0e0e0
    /// Accent: #FF6600
    static let nightTheme = ThemeColors(
        background: Color(red: 26/255, green: 26/255, blue: 26/255),
        secondaryBackground: Color(red: 35/255, green: 35/255, blue: 35/255),
        text: Color(red: 224/255, green: 224/255, blue: 224/255),
        secondaryText: Color(red: 160/255, green: 160/255, blue: 160/255),
        accent: ThemeColors.hackerNewsOrange,
        separator: Color(red: 60/255, green: 60/255, blue: 60/255),
        cardBackground: Color(red: 30/255, green: 30/255, blue: 30/255)
    )
    
    /// AMOLED Black theme colors
    /// Background: #000000
    /// Text: #ffffff
    /// Accent: #FF6600
    static let amoledBlackTheme = ThemeColors(
        background: Color.black,
        secondaryBackground: Color(red: 15/255, green: 15/255, blue: 15/255),
        text: Color.white,
        secondaryText: Color(red: 180/255, green: 180/255, blue: 180/255),
        accent: ThemeColors.hackerNewsOrange,
        separator: Color(red: 40/255, green: 40/255, blue: 40/255),
        cardBackground: Color(red: 10/255, green: 10/255, blue: 10/255)
    )
    
    /// Determine the appropriate theme based on system color scheme
    /// - Parameter colorScheme: The system color scheme
    /// - Returns: The appropriate AppTheme for the system setting
    static func systemTheme(for colorScheme: ColorScheme) -> AppTheme {
        switch colorScheme {
        case .dark:
            return .night
        case .light:
            return .default
        @unknown default:
            return .default
        }
    }
}

/// Environment key for accessing theme colors throughout the app
struct ThemeColorsKey: EnvironmentKey {
    static let defaultValue: ThemeColors = ThemeManager.defaultTheme
}

extension EnvironmentValues {
    var themeColors: ThemeColors {
        get { self[ThemeColorsKey.self] }
        set { self[ThemeColorsKey.self] = newValue }
    }
}

/// View modifier to apply theme colors to a view
struct ThemedViewModifier: ViewModifier {
    let theme: AppTheme
    
    func body(content: Content) -> some View {
        let colors = ThemeManager.colors(for: theme)
        content
            .environment(\.themeColors, colors)
            .background(colors.background)
            .foregroundColor(colors.text)
    }
}

extension View {
    /// Apply the current theme to this view and its children
    func themed(_ theme: AppTheme) -> some View {
        modifier(ThemedViewModifier(theme: theme))
    }
}

/// A view that automatically responds to theme changes
struct ThemedBackground: View {
    @EnvironmentObject var settingsService: SettingsService
    
    var body: some View {
        ThemeManager.colors(for: settingsService.settings.theme).background
            .ignoresSafeArea()
    }
}
