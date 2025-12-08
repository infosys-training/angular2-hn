// swift-tools-version:5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "HackerNewsDataLayer",
    platforms: [
        .iOS(.v15),
        .macOS(.v12)
    ],
    products: [
        .library(
            name: "HackerNewsDataLayer",
            targets: ["HackerNewsDataLayer"]
        ),
    ],
    targets: [
        .target(
            name: "HackerNewsDataLayer",
            dependencies: [],
            path: "Sources"
        ),
        .testTarget(
            name: "HackerNewsDataLayerTests",
            dependencies: ["HackerNewsDataLayer"],
            path: "Tests"
        ),
    ]
)
