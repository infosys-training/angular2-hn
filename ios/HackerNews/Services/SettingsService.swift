//
//  SettingsService.swift
//  HackerNews
//
//  iOS equivalent of Angular SettingsService
//  Migrated from: src/app/shared/services/settings.service.ts
//  Persists settings using UserDefaults, replacing localStorage
//

import SwiftUI
import Combine

/// SettingsService manages application settings with UserDefaults persistence
/// This is an ObservableObject singleton that provides reactive updates for settings
/// Replaces: src/app/shared/services/settings.service.ts
final class SettingsService: ObservableObject {
    
    // MARK: - Singleton
    
    /// Shared instance for use as a singleton
    static let shared = SettingsService()
    
    // MARK: - Published Properties
    
    /// Current settings - published for reactive updates
    @Published var settings: Settings
    
    /// Whether the settings modal is currently shown
    @Published var showSettings: Bool = false
    
    /// Current system color scheme
    @Published var systemColorScheme: ColorScheme = .light
    
    // MARK: - UserDefaults Keys
    
    private enum UserDefaultsKeys {
        static let openLinkInSafari = "openLinkInSafari"
        static let theme = "theme"
        static let titleFontSize = "titleFontSize"
        static let listSpacing = "listSpacing"
        static let hasManualThemeOverride = "hasManualThemeOverride"
    }
    
    // MARK: - Private Properties
    
    private let userDefaults: UserDefaults
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    
    /// Initialize the settings service
    /// - Parameter userDefaults: UserDefaults instance to use (defaults to .standard)
    init(userDefaults: UserDefaults = .standard) {
        self.userDefaults = userDefaults
        
        // Load settings from UserDefaults or use defaults
        self.settings = Settings(
            openLinkInSafari: userDefaults.object(forKey: UserDefaultsKeys.openLinkInSafari) as? Bool ?? Settings.defaultSettings.openLinkInSafari,
            theme: AppTheme(rawValue: userDefaults.string(forKey: UserDefaultsKeys.theme) ?? "") ?? Settings.defaultSettings.theme,
            titleFontSize: userDefaults.string(forKey: UserDefaultsKeys.titleFontSize) ?? Settings.defaultSettings.titleFontSize,
            listSpacing: userDefaults.string(forKey: UserDefaultsKeys.listSpacing) ?? Settings.defaultSettings.listSpacing,
            hasManualThemeOverride: userDefaults.object(forKey: UserDefaultsKeys.hasManualThemeOverride) as? Bool ?? Settings.defaultSettings.hasManualThemeOverride
        )
        
        // Subscribe to settings changes to persist them
        setupSettingsObserver()
    }
    
    // MARK: - Private Methods
    
    /// Set up observer to persist settings changes to UserDefaults
    private func setupSettingsObserver() {
        $settings
            .dropFirst() // Skip initial value
            .sink { [weak self] newSettings in
                self?.persistSettings(newSettings)
            }
            .store(in: &cancellables)
    }
    
    /// Persist settings to UserDefaults
    /// - Parameter settings: The settings to persist
    private func persistSettings(_ settings: Settings) {
        userDefaults.set(settings.openLinkInSafari, forKey: UserDefaultsKeys.openLinkInSafari)
        userDefaults.set(settings.theme.rawValue, forKey: UserDefaultsKeys.theme)
        userDefaults.set(settings.titleFontSize, forKey: UserDefaultsKeys.titleFontSize)
        userDefaults.set(settings.listSpacing, forKey: UserDefaultsKeys.listSpacing)
        userDefaults.set(settings.hasManualThemeOverride, forKey: UserDefaultsKeys.hasManualThemeOverride)
    }
    
    // MARK: - Public Methods
    
    /// Toggle the settings modal visibility
    func toggleSettings() {
        showSettings.toggle()
    }
    
    /// Toggle whether links should open in Safari
    /// iOS equivalent of Angular's toggleOpenLinksInNewTab()
    func toggleOpenLinksInSafari() {
        settings.openLinkInSafari.toggle()
    }
    
    /// Set the application theme
    /// - Parameter theme: The theme to apply
    func setTheme(_ theme: AppTheme) {
        settings.theme = theme
        settings.hasManualThemeOverride = true
    }
    
    /// Set the title font size
    /// - Parameter fontSize: The font size as a string
    func setFont(_ fontSize: String) {
        settings.titleFontSize = fontSize
    }
    
    /// Set the list spacing
    /// - Parameter spacing: The spacing value as a string
    func setSpacing(_ spacing: String) {
        settings.listSpacing = spacing
    }
    
    /// Update theme based on system color scheme (if no manual override)
    /// - Parameter colorScheme: The system color scheme
    func updateSystemColorScheme(_ colorScheme: ColorScheme) {
        systemColorScheme = colorScheme
        
        // Only auto-switch theme if user hasn't manually selected one
        if !settings.hasManualThemeOverride {
            settings.theme = ThemeManager.systemTheme(for: colorScheme)
        }
    }
    
    /// Reset theme to follow system preference
    func resetToSystemTheme() {
        settings.hasManualThemeOverride = false
        settings.theme = ThemeManager.systemTheme(for: systemColorScheme)
    }
    
    /// Get the current theme colors
    var currentThemeColors: ThemeColors {
        ThemeManager.colors(for: settings.theme)
    }
    
    /// Reset all settings to defaults
    func resetToDefaults() {
        settings = Settings.defaultSettings
        updateSystemColorScheme(systemColorScheme)
    }
}

// MARK: - Environment Object Extension

/// View modifier to inject SettingsService as an environment object
struct SettingsServiceEnvironmentModifier: ViewModifier {
    @StateObject private var settingsService = SettingsService.shared
    
    func body(content: Content) -> some View {
        content
            .environmentObject(settingsService)
    }
}

extension View {
    /// Inject the shared SettingsService as an environment object
    func withSettingsService() -> some View {
        modifier(SettingsServiceEnvironmentModifier())
    }
}

// MARK: - System Color Scheme Observer

/// A view that observes system color scheme changes and updates SettingsService
struct SystemColorSchemeObserver: View {
    @Environment(\.colorScheme) var colorScheme
    @EnvironmentObject var settingsService: SettingsService
    
    var body: some View {
        Color.clear
            .onChange(of: colorScheme) { newColorScheme in
                settingsService.updateSystemColorScheme(newColorScheme)
            }
            .onAppear {
                settingsService.updateSystemColorScheme(colorScheme)
            }
    }
}
