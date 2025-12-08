import Foundation

/// Custom error types for Hacker News API failures
public enum HackerNewsError: Error, Equatable, Sendable {
    case invalidURL
    case networkError(String)
    case decodingError(String)
    case serverError(statusCode: Int)
    case noData
    case cancelled
    case unknown(String)
    
    public var localizedDescription: String {
        switch self {
        case .invalidURL:
            return "The URL is invalid. Please try again."
        case .networkError(let message):
            return "Network error: \(message)"
        case .decodingError(let message):
            return "Failed to parse response: \(message)"
        case .serverError(let statusCode):
            return "Server error (status code: \(statusCode)). Please try again later."
        case .noData:
            return "No data received from the server."
        case .cancelled:
            return "The request was cancelled."
        case .unknown(let message):
            return "An unexpected error occurred: \(message)"
        }
    }
    
    public var isRetryable: Bool {
        switch self {
        case .networkError, .serverError, .noData:
            return true
        case .invalidURL, .decodingError, .cancelled, .unknown:
            return false
        }
    }
}

extension HackerNewsError: LocalizedError {
    public var errorDescription: String? {
        return localizedDescription
    }
}
