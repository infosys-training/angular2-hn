import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var settingsService: SettingsService
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Appearance")) {
                    Picker("Theme", selection: $settingsService.settings.theme) {
                        ForEach(Theme.allCases, id: \.self) { theme in
                            Text(theme.displayName).tag(theme)
                        }
                    }
                    
                    VStack(alignment: .leading) {
                        Text("Title Font Size: \(Int(settingsService.settings.titleFontSize))")
                        Slider(
                            value: $settingsService.settings.titleFontSize,
                            in: 12...24,
                            step: 1
                        )
                    }
                    
                    VStack(alignment: .leading) {
                        Text("List Spacing: \(Int(settingsService.settings.listSpacing))")
                        Slider(
                            value: $settingsService.settings.listSpacing,
                            in: 0...20,
                            step: 2
                        )
                    }
                }
                
                Section(header: Text("Behavior")) {
                    Toggle("Open Links Externally", isOn: $settingsService.settings.openLinkInNewTab)
                }
                
                Section {
                    Button("Reset to Defaults") {
                        settingsService.resetToDefaults()
                    }
                    .foregroundColor(.red)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
            .environmentObject(SettingsService())
    }
}
