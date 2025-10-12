import { of } from 'rxjs';
import { Settings } from '../models/settings';

export class MockSettingsService {
    settings: Settings = {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
    };

    toggleSettings = jasmine.createSpy('toggleSettings');
    toggleOpenLinksInNewTab = jasmine.createSpy('toggleOpenLinksInNewTab');
    setTheme = jasmine.createSpy('setTheme');
    setFont = jasmine.createSpy('setFont');
    setSpacing = jasmine.createSpy('setSpacing');
}

export class MockHackerNewsAPIService {
    baseUrl = 'https://node-hnapi.herokuapp.com';

    fetchFeed = jasmine.createSpy('fetchFeed').and.returnValue(of([]));
    fetchItemContent = jasmine.createSpy('fetchItemContent').and.returnValue(of({}));
    fetchPollContent = jasmine.createSpy('fetchPollContent').and.returnValue(of({}));
    fetchUser = jasmine.createSpy('fetchUser').and.returnValue(of({}));
}
