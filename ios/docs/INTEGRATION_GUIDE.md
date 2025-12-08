# iOS Integration Guide for Parallel Development

This guide helps developers from other sessions integrate their work into the iOS foundation.

## Overview

The iOS project is structured to support parallel development across multiple sessions. Each session can work on specific features independently while following consistent patterns.

## Getting Started

### Prerequisites

- macOS 13.0 or later
- Xcode 15.0 or later
- iOS 15.0+ Simulator or device
- Git

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/infosys-training/angular2-hn.git
cd angular2-hn

# Open the iOS project in Xcode
open ios/HackerNewsApp/HackerNewsApp.xcodeproj
```

### Build and Run

1. Open `ios/HackerNewsApp/HackerNewsApp.xcodeproj` in Xcode
2. Select a simulator (iPhone 14 Pro recommended)
3. Press `Cmd + R` to build and run

## Project Structure

```
ios/HackerNewsApp/HackerNewsApp/
├── HackerNewsAppApp.swift    # App entry point - DO NOT MODIFY without coordination
├── Models/                   # Data models - shared across all sessions
├── Views/                    # UI components - session-specific work goes here
├── Services/                 # Business logic - shared services
├── Core/                     # Shared UI components (Header, Footer, Settings)
└── Utilities/                # Helper functions and extensions
```

## Session Integration Points

### Session: Feed List Implementation

**Files to create/modify:**
- `Views/FeedView.swift` - Main feed list view
- `Views/StoryRowView.swift` - Individual story row component

**Dependencies:**
- `Models/Story.swift` - Story data model
- `Models/FeedType.swift` - Feed type enum
- `Services/HackerNewsAPIService.swift` - API service
- `Services/AppState.swift` - App state management

**Example integration:**

```swift
// Views/FeedView.swift
import SwiftUI

struct FeedView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var hackerNewsAPI: HackerNewsAPIService
    @State private var stories: [Story] = []
    @State private var isLoading = false
    
    var body: some View {
        List(stories) { story in
            StoryRowView(story: story)
        }
        .onAppear {
            loadStories()
        }
    }
    
    private func loadStories() {
        // Use hackerNewsAPI.fetchFeed()
    }
}
```

### Session: Item Details Implementation

**Files to create/modify:**
- `Views/ItemDetailView.swift` - Story detail view
- `Views/CommentView.swift` - Comment component
- `Views/CommentThreadView.swift` - Nested comments

**Dependencies:**
- `Models/Story.swift` - Story with comments
- `Models/Comment.swift` - Comment model
- `Services/HackerNewsAPIService.swift` - API service

### Session: User Profile Implementation

**Files to create/modify:**
- `Views/UserProfileView.swift` - User profile view

**Dependencies:**
- `Models/User.swift` - User model
- `Services/HackerNewsAPIService.swift` - API service

### Session: Settings Implementation

**Files to modify:**
- `Core/SettingsView.swift` - Settings UI (already created)
- `Services/SettingsService.swift` - Settings logic (already created)

**Dependencies:**
- `Models/Settings.swift` - Settings model

## Adding New Views

1. Create your view file in the appropriate folder
2. Use `@EnvironmentObject` to access shared services
3. Follow the existing naming conventions
4. Add previews for SwiftUI canvas

```swift
import SwiftUI

struct MyNewView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var settingsService: SettingsService
    @EnvironmentObject var hackerNewsAPI: HackerNewsAPIService
    
    var body: some View {
        // Your view implementation
    }
}

struct MyNewView_Previews: PreviewProvider {
    static var previews: some View {
        MyNewView()
            .environmentObject(AppState())
            .environmentObject(SettingsService())
            .environmentObject(HackerNewsAPIService())
    }
}
```

## Adding New Models

1. Create model file in `Models/` folder
2. Conform to `Codable`, `Identifiable`, and `Equatable`
3. Use `CodingKeys` for API field mapping
4. Add placeholder/mock data for previews

```swift
import Foundation

struct MyModel: Codable, Identifiable, Equatable {
    let id: Int
    let name: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case name = "api_name"  // Map to API field name
    }
}
```

## Adding New Services

1. Create service file in `Services/` folder
2. Conform to `ObservableObject`
3. Create a protocol for testability
4. Register in `HackerNewsAppApp.swift` if needed globally

```swift
import Foundation
import Combine

protocol MyServiceProtocol {
    func doSomething() -> AnyPublisher<Result, Error>
}

class MyService: ObservableObject, MyServiceProtocol {
    @Published var data: [MyModel] = []
    
    func doSomething() -> AnyPublisher<Result, Error> {
        // Implementation
    }
}
```

## Navigation Integration

The app uses `NavigationView` with `NavigationLink` for navigation:

```swift
NavigationLink(destination: ItemDetailView(storyId: story.id)) {
    StoryRowView(story: story)
}
```

For programmatic navigation, use `@State` with `NavigationLink`:

```swift
@State private var selectedStoryId: Int?

NavigationLink(
    destination: ItemDetailView(storyId: selectedStoryId ?? 0),
    isActive: Binding(
        get: { selectedStoryId != nil },
        set: { if !$0 { selectedStoryId = nil } }
    )
) {
    EmptyView()
}
```

## State Management Patterns

### Local State
Use `@State` for view-local state:
```swift
@State private var isExpanded = false
```

### Shared State
Use `@EnvironmentObject` for app-wide state:
```swift
@EnvironmentObject var appState: AppState
```

### Derived State
Use computed properties or `@Binding`:
```swift
var filteredStories: [Story] {
    stories.filter { !$0.dead }
}
```

## API Integration

Use the `HackerNewsAPIService` for all API calls:

```swift
@EnvironmentObject var hackerNewsAPI: HackerNewsAPIService
@State private var cancellables = Set<AnyCancellable>()

func loadData() {
    hackerNewsAPI.fetchFeed(feedType: .news, page: 1)
        .sink(
            receiveCompletion: { completion in
                if case .failure(let error) = completion {
                    // Handle error
                }
            },
            receiveValue: { stories in
                self.stories = stories
            }
        )
        .store(in: &cancellables)
}
```

## Testing Your Changes

### Unit Tests
Add tests in `HackerNewsAppTests/`:
```swift
import XCTest
@testable import HackerNewsApp

class MyViewModelTests: XCTestCase {
    func testSomething() {
        // Test implementation
    }
}
```

### UI Tests
Add UI tests in `HackerNewsAppUITests/`:
```swift
import XCTest

class MyUITests: XCTestCase {
    func testNavigation() {
        let app = XCUIApplication()
        app.launch()
        // UI test implementation
    }
}
```

### SwiftUI Previews
Always add previews for visual testing:
```swift
struct MyView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            MyView()
                .previewDisplayName("Light Mode")
            MyView()
                .preferredColorScheme(.dark)
                .previewDisplayName("Dark Mode")
        }
    }
}
```

## Git Workflow

1. Create a feature branch from `master`:
   ```bash
   git checkout -b devin/$(date +%s)-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add <specific-files>
   git commit -m "feat: add feature description"
   ```

3. Push and create a PR:
   ```bash
   git push origin your-branch-name
   ```

4. Request review and merge

## Common Issues

### Build Errors

1. **Missing environment object**: Ensure all required `@EnvironmentObject` are provided in previews
2. **Type mismatch**: Check `CodingKeys` match API response
3. **Combine errors**: Ensure publishers are stored in `cancellables`

### Runtime Issues

1. **API errors**: Check network connectivity and API endpoint
2. **State not updating**: Ensure `@Published` properties are used
3. **Navigation issues**: Check `NavigationView` hierarchy

## Contact

For questions about the iOS foundation, refer to:
- `ios/docs/ADR-001-iOS-Architecture.md` - Architecture decisions
- `ios/README.md` - Build and run instructions
- `ios/CAPACITOR_INTEGRATION.md` - Hybrid features guide
