//
//  SettingsView.swift
//  HackerNews
//
//  iOS equivalent of Angular settings.component.ts/html
//  Migrated from: src/app/core/settings/settings.component.ts
//                 src/app/core/settings/settings.component.html
//

import SwiftUI

/// Settings modal view that allows users to configure app preferences
/// Replaces: src/app/core/settings/settings.component.html
struct SettingsView: View {
    @EnvironmentObject var settingsService: SettingsService
    @Environment(\.dismiss) var dismiss
    
    /// Local state for font size input
    @State private var fontSizeText: String = ""
    
    /// Local state for list spacing input
    @State private var listSpacingText: String = ""
    
    var body: some View {
        NavigationView {
            Form {
                // MARK: - Links Section
                Section {
                    Toggle("Open links in Safari", isOn: Binding(
                        get: { settingsService.settings.openLinkInSafari },
                        set: { _ in settingsService.toggleOpenLinksInSafari() }
                    ))
                } header: {
                    Text("Links")
                }
                
                // MARK: - Theme Section
                Section {
                    ForEach(AppTheme.allCases, id: \.self) { theme in
                        ThemeSelectionRow(
                            theme: theme,
                            isSelected: settingsService.settings.theme == theme,
                            onSelect: {
                                settingsService.setTheme(theme)
                            }
                        )
                    }
                    
                    if settingsService.settings.hasManualThemeOverride {
                        Button("Reset to System Theme") {
                            settingsService.resetToSystemTheme()
                        }
                        .foregroundColor(settingsService.currentThemeColors.accent)
                    }
                } header: {
                    Text("Select a theme")
                } footer: {
                    if settingsService.settings.hasManualThemeOverride {
                        Text("Theme is manually set. Tap 'Reset to System Theme' to follow system preference.")
                    } else {
                        Text("Theme follows system preference.")
                    }
                }
                
                // MARK: - Font Section
                Section {
                    HStack {
                        Text("Font size:")
                        Spacer()
                        TextField("16", text: $fontSizeText)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                            .onChange(of: fontSizeText) { newValue in
                                if !newValue.isEmpty {
                                    settingsService.setFont(newValue)
                                }
                            }
                    }
                    
                    HStack {
                        Text("List spacing:")
                        Spacer()
                        TextField("0", text: $listSpacingText)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                            .onChange(of: listSpacingText) { newValue in
                                if !newValue.isEmpty {
                                    settingsService.setSpacing(newValue)
                                }
                            }
                    }
                } header: {
                    Text("Change Font")
                }
                
                // MARK: - Reset Section
                Section {
                    Button("Reset All Settings") {
                        settingsService.resetToDefaults()
                        updateLocalState()
                    }
                    .foregroundColor(.red)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .onAppear {
                updateLocalState()
            }
        }
        .presentationDetents([.medium, .large])
    }
    
    /// Update local state from settings service
    private func updateLocalState() {
        fontSizeText = settingsService.settings.titleFontSize
        listSpacingText = settingsService.settings.listSpacing
    }
}

/// Row view for theme selection
struct ThemeSelectionRow: View {
    let theme: AppTheme
    let isSelected: Bool
    let onSelect: () -> Void
    
    var body: some View {
        Button(action: onSelect) {
            HStack {
                // Theme preview circle
                Circle()
                    .fill(previewColor)
                    .frame(width: 24, height: 24)
                    .overlay(
                        Circle()
                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                    )
                
                Text(theme.displayName)
                    .foregroundColor(.primary)
                
                Spacer()
                
                if isSelected {
                    Image(systemName: "checkmark")
                        .foregroundColor(ThemeColors.hackerNewsOrange)
                }
            }
        }
    }
    
    /// Preview color for the theme
    private var previewColor: Color {
        switch theme {
        case .default:
            return Color(.systemBackground)
        case .night:
            return Color(red: 26/255, green: 26/255, blue: 26/255)
        case .amoledblack:
            return Color.black
        }
    }
}

// MARK: - Preview

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
            .environmentObject(SettingsService.shared)
    }
}
