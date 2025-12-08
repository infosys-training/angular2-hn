# ADR-001: iOS Application Architecture

## Status

Accepted

## Date

2024-12-08

## Context

We are migrating the Angular2-HN (Hacker News) web application to a native iOS application. The goal is to create a foundation that supports parallel development by multiple teams while maintaining consistency with the original Angular application's functionality.

### Requirements

- Native iOS application using modern Apple frameworks
- Support for iOS 15 and later
- Clear separation of concerns for parallel development
- Consistent data models with the Angular application
- Efficient state management and dependency injection
- Support for offline capabilities (future)
- Optional hybrid features via Capacitor

### Constraints

- Must integrate with the existing node-hnapi.herokuapp.com API
- Should follow Apple's Human Interface Guidelines
- Must be buildable and testable by multiple development teams

## Decision

### 1. UI Framework: SwiftUI

We chose SwiftUI over UIKit for the following reasons:

- **Declarative syntax**: Aligns with Angular's component-based approach
- **Modern development**: Better long-term support and new features
- **Preview support**: Faster iteration during development
- **State management**: Built-in property wrappers for reactive updates
- **iOS 15+ target**: Full SwiftUI feature set available

### 2. Architecture Pattern: MVVM with Environment Objects

We adopted a modified MVVM (Model-View-ViewModel) pattern using SwiftUI's environment objects:

```
┌─────────────────────────────────────────────────────────────┐
│                         App.swift                           │
│  (Entry point, scene configuration, dependency injection)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Environment Objects                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  AppState   │  │  Settings   │  │  HackerNewsAPI      │  │
│  │  Service    │  │  Service    │  │  Service            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Views                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ ContentView │  │  FeedView   │  │  ItemDetailView     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Models                                │
│  ┌───────┐  ┌─────────┐  ┌──────┐  ┌──────────┐  ┌────────┐ │
│  │ Story │  │ Comment │  │ User │  │ Settings │  │ Feed   │ │
│  │       │  │         │  │      │  │          │  │ Type   │ │
│  └───────┘  └─────────┘  └──────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Rationale:**
- Environment objects provide dependency injection similar to Angular's providers
- ObservableObject pattern enables reactive updates like RxJS
- Clear separation between UI (Views) and business logic (Services)
- Easy to test services independently

### 3. Project Structure

```
ios/HackerNewsApp/
├── HackerNewsApp/
│   ├── HackerNewsAppApp.swift    # App entry point
│   ├── Info.plist                # App configuration
│   ├── Assets.xcassets/          # Images, colors, app icon
│   ├── Models/                   # Data models
│   │   ├── Story.swift
│   │   ├── Comment.swift
│   │   ├── User.swift
│   │   ├── Settings.swift
│   │   ├── PollResult.swift
│   │   └── FeedType.swift
│   ├── Views/                    # SwiftUI views
│   │   └── ContentView.swift
│   ├── Services/                 # Business logic
│   │   ├── HackerNewsAPIService.swift
│   │   ├── SettingsService.swift
│   │   └── AppState.swift
│   ├── Core/                     # Shared components
│   │   ├── HeaderView.swift
│   │   ├── FooterView.swift
│   │   └── SettingsView.swift
│   └── Utilities/                # Helpers and extensions
│       ├── Extensions.swift
│       ├── NetworkMonitor.swift
│       └── Logger.swift
└── HackerNewsApp.xcodeproj/      # Xcode project
```

**Mapping to Angular Structure:**

| Angular | iOS |
|---------|-----|
| `app.module.ts` | `HackerNewsAppApp.swift` |
| `app.component.ts` | `ContentView.swift` |
| `shared/models/` | `Models/` |
| `shared/services/` | `Services/` |
| `core/` | `Core/` |
| `shared/pipes/` | `Utilities/Extensions.swift` |

### 4. State Management

We use a combination of:

- **@StateObject**: For owning observable objects at the view level
- **@EnvironmentObject**: For sharing state across the view hierarchy
- **@Published**: For properties that trigger view updates
- **Combine**: For async operations and data streams

This approach mirrors Angular's:
- Services → ObservableObject classes
- BehaviorSubject → @Published properties
- Observable → AnyPublisher

### 5. Networking

We use native URLSession with Combine for API calls:

- **Protocol-based**: `HackerNewsAPIServiceProtocol` for testability
- **Combine publishers**: For reactive data handling
- **Codable models**: For JSON parsing
- **Error handling**: Custom `APIError` enum

### 6. Dependency Management

We chose Swift Package Manager (SPM) over CocoaPods:

- **Native integration**: Built into Xcode
- **No additional tools**: No need for `pod install`
- **Version control friendly**: Package.resolved is simpler
- **Modern standard**: Apple's recommended approach

For Capacitor integration (optional), CocoaPods may be required for some plugins.

## Consequences

### Positive

- **Parallel development**: Clear folder structure allows multiple teams to work independently
- **Testability**: Protocol-based services enable unit testing
- **Maintainability**: Separation of concerns makes code easier to understand
- **Scalability**: Architecture supports adding new features without major refactoring
- **Consistency**: Data models match Angular app for easier migration

### Negative

- **Learning curve**: Developers unfamiliar with SwiftUI may need training
- **iOS 15+ only**: Excludes older devices (acceptable given market share)
- **Combine complexity**: Async operations require understanding of publishers

### Risks

- **API changes**: node-hnapi.herokuapp.com may change or become unavailable
- **SwiftUI limitations**: Some complex UI patterns may require UIKit bridges

## Alternatives Considered

### UIKit with MVVM-C

- **Pros**: More mature, more control, larger community
- **Cons**: More boilerplate, imperative style differs from Angular

### The Composable Architecture (TCA)

- **Pros**: Excellent testability, unidirectional data flow
- **Cons**: Steeper learning curve, additional dependency

### Capacitor-only (Hybrid)

- **Pros**: Maximum code reuse with Angular
- **Cons**: Performance limitations, less native feel

## References

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Combine Framework](https://developer.apple.com/documentation/combine)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Angular2-HN Original Repository](https://github.com/nicholasbraun/angular2-hn)
