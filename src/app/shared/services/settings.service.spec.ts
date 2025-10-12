import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;
    let mockLocalStorage: { [key: string]: string };
    let mockMatchMedia: any;

    beforeEach(() => {
        mockLocalStorage = {};

        spyOn(localStorage, 'getItem').and.callFake((key: string) => {
            return mockLocalStorage[key] || null;
        });
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
            mockLocalStorage[key] = value;
        });

        mockMatchMedia = {
            matches: false,
            media: '(prefers-color-scheme: dark)',
            addEventListener: jasmine.createSpy('addEventListener'),
            removeEventListener: jasmine.createSpy('removeEventListener'),
            dispatchEvent: jasmine.createSpy('dispatchEvent')
        };

        spyOn(window, 'matchMedia').and.returnValue(mockMatchMedia);

        TestBed.configureTestingModule({
            providers: [SettingsService]
        });
        service = TestBed.inject(SettingsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize settings with default values when localStorage is empty', () => {
        expect(service.settings.openLinkInNewTab).toBe(false);
        expect(service.settings.theme).toBe('default');
        expect(service.settings.titleFontSize).toBe('16');
        expect(service.settings.listSpacing).toBe('0');
        expect(service.settings.showSettings).toBe(false);
    });

    it('should initialize settings from localStorage when values exist', () => {
        mockLocalStorage.openLinkInNewTab = 'true';
        mockLocalStorage.titleFontSize = '18';
        mockLocalStorage.listSpacing = '5';

        const newService = new SettingsService();
        expect(newService.settings.openLinkInNewTab).toBe(true);
        expect(newService.settings.titleFontSize).toBe('18');
        expect(newService.settings.listSpacing).toBe('5');
    });

    it('should toggle showSettings', () => {
        expect(service.settings.showSettings).toBe(false);
        service.toggleSettings();
        expect(service.settings.showSettings).toBe(true);
        service.toggleSettings();
        expect(service.settings.showSettings).toBe(false);
    });

    it('should toggle openLinkInNewTab and update localStorage', () => {
        expect(service.settings.openLinkInNewTab).toBe(false);
        service.toggleOpenLinksInNewTab();
        expect(service.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');
    });

    it('should set theme and update localStorage', () => {
        service.setTheme('night');
        expect(service.settings.theme).toBe('night');
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });

    it('should set font size and update localStorage', () => {
        service.setFont('20');
        expect(service.settings.titleFontSize).toBe('20');
        expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '20');
    });

    it('should set spacing and update localStorage', () => {
        service.setSpacing('10');
        expect(service.settings.listSpacing).toBe('10');
        expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '10');
    });

    it('should subscribe to system preferred color scheme', () => {
        expect(mockMatchMedia.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });

    it('should handle system preferred color scheme change to dark', () => {
        const event = { matches: true } as MediaQueryListEvent;
        service.handleSystemPreferredColorSchemeChange(event);
        expect(service.settings.theme).toBe('night');
    });

    it('should handle system preferred color scheme change to light', () => {
        const event = { matches: false } as MediaQueryListEvent;
        service.handleSystemPreferredColorSchemeChange(event);
        expect(service.settings.theme).toBe('default');
    });

    it('should initialize theme from localStorage if saved', () => {
        mockLocalStorage.theme = 'night';
        const newService = new SettingsService();
        expect(newService.settings.theme).toBe('night');
    });

    it('should unsubscribe from system preferred color scheme on destroy', () => {
        service.ngOnDestroy();
        expect(mockMatchMedia.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
});
