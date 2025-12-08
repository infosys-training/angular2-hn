import Foundation
import SwiftUI
import Combine

class SettingsService: ObservableObject {
    @Published var settings: Settings {
        didSet {
            saveSettings()
        }
    }
    
    private let userDefaults: UserDefaults
    private let settingsKey = "app_settings"
    
    var colorScheme: ColorScheme? {
        settings.theme.colorScheme
    }
    
    init(userDefaults: UserDefaults = .standard) {
        self.userDefaults = userDefaults
        self.settings = Self.loadSettings(from: userDefaults)
    }
    
    private static func loadSettings(from userDefaults: UserDefaults) -> Settings {
        guard let data = userDefaults.data(forKey: "app_settings"),
              let settings = try? JSONDecoder().decode(Settings.self, from: data) else {
            return Settings()
        }
        return settings
    }
    
    private func saveSettings() {
        guard let data = try? JSONEncoder().encode(settings) else { return }
        userDefaults.set(data, forKey: settingsKey)
    }
    
    func toggleSettings() {
        settings.showSettings.toggle()
    }
    
    func toggleOpenLinksInNewTab() {
        settings.openLinkInNewTab.toggle()
    }
    
    func setTheme(_ theme: Theme) {
        settings.theme = theme
    }
    
    func setFontSize(_ size: CGFloat) {
        settings.titleFontSize = size
    }
    
    func setListSpacing(_ spacing: CGFloat) {
        settings.listSpacing = spacing
    }
    
    func resetToDefaults() {
        settings = Settings()
    }
}
