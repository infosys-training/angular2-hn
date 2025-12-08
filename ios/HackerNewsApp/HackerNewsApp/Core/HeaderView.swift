import SwiftUI

struct HeaderView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var settingsService: SettingsService
    
    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Hacker News")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.orange)
                
                Spacer()
                
                Button(action: {
                    settingsService.toggleSettings()
                }) {
                    Image(systemName: "gearshape.fill")
                        .foregroundColor(.primary)
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 12)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(FeedType.allCases) { feedType in
                        FeedTypeButton(
                            feedType: feedType,
                            isSelected: appState.currentFeedType == feedType
                        ) {
                            appState.selectFeed(feedType)
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.bottom, 8)
            
            Divider()
        }
        .background(Color(.systemBackground))
    }
}

struct FeedTypeButton: View {
    let feedType: FeedType
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Image(systemName: feedType.iconName)
                    .font(.caption)
                Text(feedType.displayName)
                    .font(.subheadline)
                    .fontWeight(isSelected ? .semibold : .regular)
            }
            .foregroundColor(isSelected ? .orange : .secondary)
            .padding(.vertical, 6)
            .padding(.horizontal, 12)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(isSelected ? Color.orange.opacity(0.1) : Color.clear)
            )
        }
    }
}

struct HeaderView_Previews: PreviewProvider {
    static var previews: some View {
        HeaderView()
            .environmentObject(AppState())
            .environmentObject(SettingsService())
    }
}
