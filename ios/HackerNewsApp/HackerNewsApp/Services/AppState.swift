import Foundation
import Combine

class AppState: ObservableObject {
    @Published var currentFeedType: FeedType = .news
    @Published var currentPage: Int = 1
    @Published var isLoading: Bool = false
    @Published var error: Error?
    @Published var selectedStoryId: Int?
    @Published var selectedUserId: String?
    
    private var cancellables = Set<AnyCancellable>()
    
    init() {}
    
    func selectFeed(_ feedType: FeedType) {
        currentFeedType = feedType
        currentPage = 1
    }
    
    func nextPage() {
        currentPage += 1
    }
    
    func previousPage() {
        guard currentPage > 1 else { return }
        currentPage -= 1
    }
    
    func resetPage() {
        currentPage = 1
    }
    
    func setLoading(_ loading: Bool) {
        isLoading = loading
    }
    
    func setError(_ error: Error?) {
        self.error = error
    }
    
    func clearError() {
        error = nil
    }
    
    func selectStory(_ id: Int?) {
        selectedStoryId = id
    }
    
    func selectUser(_ id: String?) {
        selectedUserId = id
    }
}
