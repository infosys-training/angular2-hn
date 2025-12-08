import SwiftUI

@main
struct HackerNewsAppApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var settingsService = SettingsService()
    @StateObject private var hackerNewsAPI = HackerNewsAPIService()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .environmentObject(settingsService)
                .environmentObject(hackerNewsAPI)
                .preferredColorScheme(settingsService.colorScheme)
        }
    }
}
