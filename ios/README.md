# Hacker News iOS App

A native iOS application for browsing Hacker News, built with SwiftUI.

## Overview

This is the iOS native implementation of the Angular2-HN web application. It provides a native mobile experience for browsing Hacker News stories, comments, and user profiles.

## Requirements

- macOS 13.0 (Ventura) or later
- Xcode 15.0 or later
- iOS 15.0+ Simulator or physical device
- Apple Developer account (for device deployment)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/infosys-training/angular2-hn.git
cd angular2-hn
```

### 2. Open in Xcode

```bash
open ios/HackerNewsApp/HackerNewsApp.xcodeproj
```

Or manually navigate to `ios/HackerNewsApp/` and double-click `HackerNewsApp.xcodeproj`.

### 3. Select Target

1. In Xcode, select the `HackerNewsApp` scheme from the scheme selector
2. Choose a simulator (e.g., iPhone 15 Pro) or connected device

### 4. Build and Run

Press `Cmd + R` or click the Play button to build and run the app.

## Project Structure

```
ios/HackerNewsApp/
├── HackerNewsApp/
│   ├── HackerNewsAppApp.swift    # App entry point with dependency injection
│   ├── Info.plist                # App configuration and permissions
│   ├── Assets.xcassets/          # App icons, colors, and images
│   ├── Models/                   # Data models
│   │   ├── Story.swift           # Story/post model
│   │   ├── Comment.swift         # Comment model
│   │   ├── User.swift            # User profile model
│   │   ├── Settings.swift        # App settings model
│   │   ├── PollResult.swift      # Poll option model
│   │   └── FeedType.swift        # Feed type enum
│   ├── Views/                    # SwiftUI views
│   │   └── ContentView.swift     # Main content view
│   ├── Services/                 # Business logic and API
│   │   ├── HackerNewsAPIService.swift  # API client
│   │   ├── SettingsService.swift       # Settings management
│   │   └── AppState.swift              # App state management
│   ├── Core/                     # Shared UI components
│   │   ├── HeaderView.swift      # App header with navigation
│   │   ├── FooterView.swift      # App footer
│   │   └── SettingsView.swift    # Settings screen
│   └── Utilities/                # Helper functions
│       ├── Extensions.swift      # Swift extensions
│       ├── NetworkMonitor.swift  # Network connectivity
│       └── Logger.swift          # Logging utilities
├── HackerNewsApp.xcodeproj/      # Xcode project configuration
├── HackerNewsAppTests/           # Unit tests
└── HackerNewsAppUITests/         # UI tests
```

## Configuration

### Bundle Identifier

The app uses `com.angular2hn.ios` as the bundle identifier. To change it:

1. Open the project in Xcode
2. Select the `HackerNewsApp` target
3. Go to the "Signing & Capabilities" tab
4. Update the Bundle Identifier

### API Configuration

The app connects to the Hacker News API at `https://node-hnapi.herokuapp.com`. This is configured in:
- `Services/HackerNewsAPIService.swift` - API base URL
- `Info.plist` - App Transport Security settings

### iOS Version Target

The minimum deployment target is iOS 15.0. To change it:

1. Open the project in Xcode
2. Select the `HackerNewsApp` target
3. Go to the "General" tab
4. Update "Minimum Deployments"

## Build Configurations

### Debug

- Optimizations disabled for faster builds
- Debug symbols included
- Testability enabled

```bash
# Build for Debug
xcodebuild -project HackerNewsApp.xcodeproj -scheme HackerNewsApp -configuration Debug build
```

### Release

- Full optimizations enabled
- Debug symbols in separate dSYM
- App Store ready

```bash
# Build for Release
xcodebuild -project HackerNewsApp.xcodeproj -scheme HackerNewsApp -configuration Release build
```

## Running Tests

### Unit Tests

```bash
# Run unit tests
xcodebuild test -project HackerNewsApp.xcodeproj -scheme HackerNewsApp -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

Or in Xcode: `Cmd + U`

### UI Tests

```bash
# Run UI tests
xcodebuild test -project HackerNewsApp.xcodeproj -scheme HackerNewsApp -destination 'platform=iOS Simulator,name=iPhone 15 Pro' -only-testing:HackerNewsAppUITests
```

## Architecture

The app follows the MVVM (Model-View-ViewModel) pattern with SwiftUI:

- **Models**: Data structures matching the API response
- **Views**: SwiftUI views for UI rendering
- **Services**: ObservableObject classes for business logic
- **Environment Objects**: Dependency injection across the view hierarchy

For detailed architecture decisions, see `docs/ADR-001-iOS-Architecture.md`.

## Features

### Current (Foundation)

- SwiftUI-based UI framework
- Environment-based dependency injection
- API service with Combine publishers
- Settings persistence with UserDefaults
- Theme support (Light/Dark/System)
- Network connectivity monitoring

### Planned

- Feed list with pagination
- Story detail view with comments
- User profile view
- Offline caching
- Push notifications
- Share functionality

## API Reference

The app uses the [node-hnapi](https://github.com/cheeaun/node-hnapi) API:

| Endpoint | Description |
|----------|-------------|
| `GET /news?page=N` | Top stories |
| `GET /newest?page=N` | New stories |
| `GET /ask?page=N` | Ask HN stories |
| `GET /show?page=N` | Show HN stories |
| `GET /jobs?page=N` | Job postings |
| `GET /item/:id` | Story details with comments |
| `GET /user/:id` | User profile |

## Troubleshooting

### Build Errors

**"No such module" error**
- Clean build folder: `Cmd + Shift + K`
- Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`

**Signing errors**
- Ensure you have a valid Apple Developer account
- Select your team in Signing & Capabilities

### Runtime Errors

**Network errors**
- Check internet connectivity
- Verify API endpoint is accessible
- Check App Transport Security settings

**UI not updating**
- Ensure `@Published` properties are used
- Check `@EnvironmentObject` is provided

## Contributing

1. Create a feature branch from `master`
2. Follow the integration guide in `docs/INTEGRATION_GUIDE.md`
3. Write tests for new functionality
4. Submit a pull request

## Documentation

- [Architecture Decision Record](docs/ADR-001-iOS-Architecture.md)
- [Integration Guide](docs/INTEGRATION_GUIDE.md)
- [Capacitor Integration](CAPACITOR_INTEGRATION.md)

## License

This project is part of the Angular2-HN migration effort. See the root LICENSE file for details.
