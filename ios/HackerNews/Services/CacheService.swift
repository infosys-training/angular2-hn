//
//  CacheService.swift
//  HackerNews
//
//  Offline caching strategy to replace Angular Service Worker
//  Migrated from: ngsw-config.json
//  Uses URLCache for HTTP caching and file-based cache for stories/comments
//

import Foundation
import Combine

/// Cache configuration constants
enum CacheConfiguration {
    /// Memory cache size: 50 MB
    static let memoryCacheSize = 50 * 1024 * 1024
    
    /// Disk cache size: 100 MB
    static let diskCacheSize = 100 * 1024 * 1024
    
    /// Cache expiration time: 1 hour for API responses
    static let apiCacheExpiration: TimeInterval = 3600
    
    /// Cache expiration time: 24 hours for story content
    static let storyCacheExpiration: TimeInterval = 86400
    
    /// Cache directory name
    static let cacheDirectoryName = "HackerNewsCache"
}

/// Represents the current network/cache status
enum CacheStatus {
    case online
    case offline
    case cached
}

/// CacheService manages offline caching for the application
/// Replaces Angular Service Worker functionality from ngsw-config.json
final class CacheService: ObservableObject {
    
    // MARK: - Singleton
    
    static let shared = CacheService()
    
    // MARK: - Published Properties
    
    /// Current cache status
    @Published var cacheStatus: CacheStatus = .online
    
    /// Whether the device is currently offline
    @Published var isOffline: Bool = false
    
    /// Last cache update timestamp
    @Published var lastCacheUpdate: Date?
    
    // MARK: - Private Properties
    
    private let urlCache: URLCache
    private let fileManager: FileManager
    private let cacheDirectory: URL
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    
    init() {
        // Configure URLCache with custom sizes
        self.urlCache = URLCache(
            memoryCapacity: CacheConfiguration.memoryCacheSize,
            diskCapacity: CacheConfiguration.diskCacheSize,
            diskPath: CacheConfiguration.cacheDirectoryName
        )
        
        // Set as shared URL cache
        URLCache.shared = self.urlCache
        
        self.fileManager = FileManager.default
        
        // Set up cache directory
        let cachesDirectory = fileManager.urls(for: .cachesDirectory, in: .userDomainMask).first!
        self.cacheDirectory = cachesDirectory.appendingPathComponent(CacheConfiguration.cacheDirectoryName)
        
        // Create cache directory if it doesn't exist
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
        
        // Start monitoring network status
        setupNetworkMonitoring()
    }
    
    // MARK: - Network Monitoring
    
    /// Set up network status monitoring
    private func setupNetworkMonitoring() {
        // In a real implementation, this would use NWPathMonitor
        // For now, we'll provide a simple implementation
        NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)
            .sink { [weak self] _ in
                self?.checkNetworkStatus()
            }
            .store(in: &cancellables)
    }
    
    /// Check current network status
    func checkNetworkStatus() {
        // This is a simplified check - in production, use NWPathMonitor
        // For demonstration, we'll assume online unless explicitly set offline
        DispatchQueue.main.async {
            self.cacheStatus = self.isOffline ? .offline : .online
        }
    }
    
    // MARK: - URL Cache Methods
    
    /// Create a URLRequest with caching policy
    /// - Parameters:
    ///   - url: The URL to request
    ///   - cachePolicy: The cache policy to use
    /// - Returns: Configured URLRequest
    func createCachedRequest(for url: URL, cachePolicy: URLRequest.CachePolicy = .returnCacheDataElseLoad) -> URLRequest {
        var request = URLRequest(url: url)
        request.cachePolicy = cachePolicy
        return request
    }
    
    /// Check if a response is cached for a given URL
    /// - Parameter url: The URL to check
    /// - Returns: True if cached response exists
    func hasCachedResponse(for url: URL) -> Bool {
        let request = URLRequest(url: url)
        return urlCache.cachedResponse(for: request) != nil
    }
    
    /// Get cached response for a URL
    /// - Parameter url: The URL to get cached response for
    /// - Returns: Cached response data if available
    func getCachedResponse(for url: URL) -> Data? {
        let request = URLRequest(url: url)
        return urlCache.cachedResponse(for: request)?.data
    }
    
    /// Store a response in the cache
    /// - Parameters:
    ///   - response: The URL response
    ///   - data: The response data
    ///   - request: The original request
    func cacheResponse(_ response: URLResponse, data: Data, for request: URLRequest) {
        let cachedResponse = CachedURLResponse(response: response, data: data)
        urlCache.storeCachedResponse(cachedResponse, for: request)
        lastCacheUpdate = Date()
    }
    
    // MARK: - File-Based Cache Methods
    
    /// Cache key for a story ID
    private func cacheKey(for storyId: Int) -> String {
        return "story_\(storyId)"
    }
    
    /// Cache key for comments of a story
    private func commentsCacheKey(for storyId: Int) -> String {
        return "comments_\(storyId)"
    }
    
    /// Save data to file cache
    /// - Parameters:
    ///   - data: Data to cache
    ///   - key: Cache key
    func saveToFileCache(_ data: Data, forKey key: String) {
        let fileURL = cacheDirectory.appendingPathComponent(key)
        
        // Create cache entry with timestamp
        let cacheEntry = CacheEntry(data: data, timestamp: Date())
        
        do {
            let encodedData = try JSONEncoder().encode(cacheEntry)
            try encodedData.write(to: fileURL)
            lastCacheUpdate = Date()
        } catch {
            print("Failed to save to file cache: \(error)")
        }
    }
    
    /// Load data from file cache
    /// - Parameter key: Cache key
    /// - Returns: Cached data if available and not expired
    func loadFromFileCache(forKey key: String, maxAge: TimeInterval = CacheConfiguration.storyCacheExpiration) -> Data? {
        let fileURL = cacheDirectory.appendingPathComponent(key)
        
        guard let encodedData = try? Data(contentsOf: fileURL),
              let cacheEntry = try? JSONDecoder().decode(CacheEntry.self, from: encodedData) else {
            return nil
        }
        
        // Check if cache is expired
        let age = Date().timeIntervalSince(cacheEntry.timestamp)
        if age > maxAge {
            // Cache expired, remove it
            try? fileManager.removeItem(at: fileURL)
            return nil
        }
        
        return cacheEntry.data
    }
    
    /// Cache a story
    /// - Parameters:
    ///   - storyData: Story data to cache
    ///   - storyId: Story ID
    func cacheStory(_ storyData: Data, storyId: Int) {
        saveToFileCache(storyData, forKey: cacheKey(for: storyId))
    }
    
    /// Get cached story
    /// - Parameter storyId: Story ID
    /// - Returns: Cached story data if available
    func getCachedStory(storyId: Int) -> Data? {
        return loadFromFileCache(forKey: cacheKey(for: storyId))
    }
    
    /// Cache comments for a story
    /// - Parameters:
    ///   - commentsData: Comments data to cache
    ///   - storyId: Story ID
    func cacheComments(_ commentsData: Data, forStoryId storyId: Int) {
        saveToFileCache(commentsData, forKey: commentsCacheKey(for: storyId))
    }
    
    /// Get cached comments for a story
    /// - Parameter storyId: Story ID
    /// - Returns: Cached comments data if available
    func getCachedComments(forStoryId storyId: Int) -> Data? {
        return loadFromFileCache(forKey: commentsCacheKey(for: storyId))
    }
    
    // MARK: - Cache Management
    
    /// Clear all cached data
    func clearAllCache() {
        // Clear URL cache
        urlCache.removeAllCachedResponses()
        
        // Clear file cache
        if let contents = try? fileManager.contentsOfDirectory(at: cacheDirectory, includingPropertiesForKeys: nil) {
            for fileURL in contents {
                try? fileManager.removeItem(at: fileURL)
            }
        }
        
        lastCacheUpdate = nil
    }
    
    /// Clear expired cache entries
    func clearExpiredCache() {
        guard let contents = try? fileManager.contentsOfDirectory(at: cacheDirectory, includingPropertiesForKeys: nil) else {
            return
        }
        
        for fileURL in contents {
            guard let encodedData = try? Data(contentsOf: fileURL),
                  let cacheEntry = try? JSONDecoder().decode(CacheEntry.self, from: encodedData) else {
                continue
            }
            
            let age = Date().timeIntervalSince(cacheEntry.timestamp)
            if age > CacheConfiguration.storyCacheExpiration {
                try? fileManager.removeItem(at: fileURL)
            }
        }
    }
    
    /// Get current cache size in bytes
    var currentCacheSize: Int {
        urlCache.currentDiskUsage + urlCache.currentMemoryUsage
    }
    
    /// Get formatted cache size string
    var formattedCacheSize: String {
        let formatter = ByteCountFormatter()
        formatter.countStyle = .file
        return formatter.string(fromByteCount: Int64(currentCacheSize))
    }
}

// MARK: - Cache Entry

/// Represents a cached entry with timestamp for expiration checking
private struct CacheEntry: Codable {
    let data: Data
    let timestamp: Date
}

// MARK: - Offline Indicator View

/// A view that displays an offline indicator when the device is offline
struct OfflineIndicatorView: View {
    @ObservedObject var cacheService = CacheService.shared
    
    var body: some View {
        if cacheService.isOffline {
            HStack {
                Image(systemName: "wifi.slash")
                Text("Offline - Showing cached content")
                    .font(.caption)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color.orange.opacity(0.9))
            .foregroundColor(.white)
            .cornerRadius(8)
        }
    }
}

// MARK: - URLSession Extension

extension URLSession {
    /// Perform a data task with caching support
    /// - Parameters:
    ///   - request: The URL request
    ///   - cacheService: The cache service to use
    /// - Returns: Publisher for the data task
    func cachedDataTaskPublisher(for request: URLRequest, cacheService: CacheService = .shared) -> AnyPublisher<Data, Error> {
        // Check cache first if offline
        if cacheService.isOffline, let cachedData = cacheService.getCachedResponse(for: request.url!) {
            return Just(cachedData)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        return dataTaskPublisher(for: request)
            .map { output -> Data in
                // Cache the response
                cacheService.cacheResponse(output.response, data: output.data, for: request)
                return output.data
            }
            .mapError { $0 as Error }
            .eraseToAnyPublisher()
    }
}
