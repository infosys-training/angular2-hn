//
//  HeaderView.swift
//  HackerNews
//
//  iOS equivalent of Angular header.component.html
//  Migrated from: src/app/core/header/header.component.html
//  Contains the settings gear icon for accessing settings modal
//

import SwiftUI

/// Header view with navigation and settings access
/// Replaces: src/app/core/header/header.component.html
struct HeaderView: View {
    @EnvironmentObject var settingsService: SettingsService
    @ObservedObject var cacheService = CacheService.shared
    
    /// Callback for navigation actions
    var onNavigate: ((NavigationDestination) -> Void)?
    
    var body: some View {
        HStack {
            // Logo and home link
            Button(action: { onNavigate?(.news) }) {
                HStack(spacing: 8) {
                    Image(systemName: "y.square.fill")
                        .font(.title2)
                        .foregroundColor(settingsService.currentThemeColors.accent)
                    
                    Text("Hacker News")
                        .font(.headline)
                        .foregroundColor(settingsService.currentThemeColors.text)
                }
            }
            
            Spacer()
            
            // Navigation links
            HStack(spacing: 12) {
                NavigationLink(destination: .newest, label: "new")
                NavigationLink(destination: .show, label: "show")
                NavigationLink(destination: .ask, label: "ask")
                NavigationLink(destination: .jobs, label: "jobs")
            }
            .font(.subheadline)
            
            Spacer()
            
            // Settings gear icon
            Button(action: {
                settingsService.toggleSettings()
            }) {
                Image(systemName: "gearshape.fill")
                    .font(.title3)
                    .foregroundColor(settingsService.currentThemeColors.secondaryText)
            }
            .accessibilityLabel("Settings")
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(settingsService.currentThemeColors.background)
    }
    
    /// Navigation link button
    @ViewBuilder
    private func NavigationLink(destination: NavigationDestination, label: String) -> some View {
        Button(action: { onNavigate?(destination) }) {
            Text(label)
                .foregroundColor(settingsService.currentThemeColors.secondaryText)
        }
    }
}

/// Navigation destinations for the header
enum NavigationDestination {
    case news
    case newest
    case show
    case ask
    case jobs
}

/// View modifier to add settings sheet presentation
struct SettingsSheetModifier: ViewModifier {
    @EnvironmentObject var settingsService: SettingsService
    
    func body(content: Content) -> some View {
        content
            .sheet(isPresented: $settingsService.showSettings) {
                SettingsView()
                    .environmentObject(settingsService)
            }
    }
}

extension View {
    /// Add settings sheet presentation capability
    func withSettingsSheet() -> some View {
        modifier(SettingsSheetModifier())
    }
}

/// Toolbar item for settings gear icon
struct SettingsToolbarItem: ToolbarContent {
    @EnvironmentObject var settingsService: SettingsService
    
    var body: some ToolbarContent {
        ToolbarItem(placement: .navigationBarTrailing) {
            Button(action: {
                settingsService.toggleSettings()
            }) {
                Image(systemName: "gearshape.fill")
                    .foregroundColor(settingsService.currentThemeColors.secondaryText)
            }
            .accessibilityLabel("Settings")
        }
    }
}

// MARK: - Preview

struct HeaderView_Previews: PreviewProvider {
    static var previews: some View {
        HeaderView()
            .environmentObject(SettingsService.shared)
    }
}
