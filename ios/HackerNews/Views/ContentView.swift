//
//  ContentView.swift
//  HackerNews
//
//  Main content view demonstrating integration of settings, theme, and cache services
//  This serves as the root view for the application
//

import SwiftUI

/// Main content view that integrates all services and demonstrates their usage
struct ContentView: View {
    @StateObject private var settingsService = SettingsService.shared
    @ObservedObject private var cacheService = CacheService.shared
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        NavigationView {
            ZStack {
                // Themed background
                settingsService.currentThemeColors.background
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Offline indicator
                    OfflineIndicatorView()
                        .padding(.top, 8)
                    
                    // Main content area
                    ScrollView {
                        VStack(alignment: .leading, spacing: settingsService.settings.listSpacingValue + 12) {
                            // Placeholder for story list
                            ForEach(0..<10, id: \.self) { index in
                                StoryRowPlaceholder(index: index)
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Hacker News")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                SettingsToolbarItem()
            }
        }
        .environmentObject(settingsService)
        .withSettingsSheet()
        .onChange(of: colorScheme) { newColorScheme in
            settingsService.updateSystemColorScheme(newColorScheme)
        }
        .onAppear {
            settingsService.updateSystemColorScheme(colorScheme)
        }
    }
}

/// Placeholder view for a story row (demonstrates theme and font size usage)
struct StoryRowPlaceholder: View {
    @EnvironmentObject var settingsService: SettingsService
    let index: Int
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Story Title \(index + 1)")
                .font(.system(size: settingsService.settings.titleFontSizeValue))
                .foregroundColor(settingsService.currentThemeColors.text)
            
            HStack {
                Text("100 points")
                Text("by author")
                Text("2 hours ago")
                Text("50 comments")
            }
            .font(.caption)
            .foregroundColor(settingsService.currentThemeColors.secondaryText)
        }
        .padding()
        .background(settingsService.currentThemeColors.cardBackground)
        .cornerRadius(8)
    }
}

// MARK: - App Entry Point Example

/// Example App structure showing how to set up the application
/// This would be in the main App.swift file
/*
@main
struct HackerNewsApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
*/

// MARK: - Preview

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            ContentView()
                .previewDisplayName("Default Theme")
            
            ContentView()
                .preferredColorScheme(.dark)
                .previewDisplayName("Dark Mode")
        }
    }
}
