# Capacitor Integration Guide

This document describes how to integrate Capacitor for hybrid features in the Hacker News iOS app.

## Overview

Capacitor is a cross-platform native runtime that makes it easy to build web apps that run natively on iOS, Android, and the web. While this project primarily uses native SwiftUI, Capacitor can be used for specific hybrid features or to share code between platforms.

## Prerequisites

- Node.js 16+ and npm/yarn
- Xcode 15+ with iOS 15+ SDK
- CocoaPods (for Capacitor iOS dependencies)

## Installation

### 1. Install Capacitor Core Packages

```bash
# From the project root directory
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios
```

### 2. Initialize Capacitor

```bash
npx cap init "Hacker News" "com.angular2hn.ios" --web-dir dist/angular-hnpwa
```

### 3. Add iOS Platform

```bash
npx cap add ios
```

This will create a `ios/App` directory with the Capacitor iOS project.

### 4. Sync Web Assets

After building the Angular app, sync the web assets to the iOS project:

```bash
ng build --configuration production
npx cap sync ios
```

## Configuration

The `capacitor.config.ts` file in the project root contains the Capacitor configuration:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.angular2hn.ios',
  appName: 'Hacker News',
  webDir: 'dist/angular-hnpwa',
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
};

export default config;
```

## Adding Native Plugins

### Official Capacitor Plugins

Capacitor provides official plugins for common native functionality:

```bash
# App plugin (app state, URL handling)
npm install @capacitor/app

# Browser plugin (in-app browser)
npm install @capacitor/browser

# Clipboard plugin
npm install @capacitor/clipboard

# Haptics plugin (vibration feedback)
npm install @capacitor/haptics

# Keyboard plugin
npm install @capacitor/keyboard

# Network plugin (connectivity status)
npm install @capacitor/network

# Preferences plugin (key-value storage)
npm install @capacitor/preferences

# Share plugin (native share sheet)
npm install @capacitor/share

# Splash Screen plugin
npm install @capacitor/splash-screen

# Status Bar plugin
npm install @capacitor/status-bar
```

After installing plugins, sync with iOS:

```bash
npx cap sync ios
```

### Using Plugins in Angular

```typescript
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Open external URL in browser
async function openUrl(url: string) {
  await Browser.open({ url });
}

// Share content
async function shareStory(title: string, url: string) {
  await Share.share({
    title: title,
    url: url,
    dialogTitle: 'Share this story',
  });
}

// Haptic feedback
async function hapticFeedback() {
  await Haptics.impact({ style: ImpactStyle.Medium });
}
```

### Creating Custom Native Plugins

For functionality not covered by official plugins, you can create custom plugins:

1. Create a Swift plugin class in the iOS project:

```swift
// ios/App/App/Plugins/CustomPlugin.swift
import Capacitor

@objc(CustomPlugin)
public class CustomPlugin: CAPPlugin {
    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve(["value": value])
    }
}
```

2. Register the plugin in `ios/App/App/AppDelegate.swift`:

```swift
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    // ...
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Register custom plugins
        let bridge = self.window?.rootViewController as? CAPBridgeViewController
        bridge?.bridge?.registerPluginInstance(CustomPlugin())
        return true
    }
}
```

3. Create TypeScript definitions:

```typescript
// src/plugins/custom-plugin.ts
import { registerPlugin } from '@capacitor/core';

export interface CustomPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}

const CustomPlugin = registerPlugin<CustomPlugin>('CustomPlugin');

export default CustomPlugin;
```

## Hybrid Architecture Considerations

### When to Use Capacitor

- Sharing web components between platforms
- Rapid prototyping of features
- Features that don't require native performance
- Leveraging existing Angular code

### When to Use Native SwiftUI

- Performance-critical features
- Complex animations and gestures
- Deep OS integration
- Features requiring latest iOS APIs

### Recommended Approach

For this Hacker News app, we recommend:

1. **Native SwiftUI** for:
   - Main UI and navigation
   - Feed lists and item details
   - Settings and preferences
   - Offline caching

2. **Capacitor/Web** for:
   - Rendering HTML content (comments with formatting)
   - Sharing functionality
   - External link handling

## Troubleshooting

### Common Issues

1. **Pod install fails**: Run `pod repo update` and try again
2. **Build errors after plugin install**: Run `npx cap sync ios`
3. **Plugin not found**: Ensure plugin is registered in AppDelegate

### Useful Commands

```bash
# Update Capacitor
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/ios@latest

# Clean and rebuild
npx cap sync ios --deployment

# Open in Xcode
npx cap open ios

# Check for updates
npx cap doctor
```

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Official Plugins](https://capacitorjs.com/docs/apis)
- [Community Plugins](https://github.com/capacitor-community)
