import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;
    let mockRouter: any;
    let routerEventsSubject: Subject<any>;
    let gaFunction: jasmine.Spy;

    beforeEach(async () => {
        routerEventsSubject = new Subject();
        mockRouter = {
            events: routerEventsSubject.asObservable()
        };

        mockSettingsService = jasmine.createSpyObj('SettingsService', []);
        mockSettingsService.settings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0'
        };

        gaFunction = jasmine.createSpy('ga');
        (window as any).ga = gaFunction;

        await TestBed.configureTestingModule({
            declarations: [AppComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should inject settings from SettingsService', () => {
        expect(component.settings).toEqual(mockSettingsService.settings);
    });

    it('should call Google Analytics on NavigationEnd event', () => {
        const navigationEndEvent = new NavigationEnd(1, '/test-url', '/test-url');
        routerEventsSubject.next(navigationEndEvent);

        expect(gaFunction).toHaveBeenCalledWith('set', 'page', '/test-url');
        expect(gaFunction).toHaveBeenCalledWith('send', 'pageview');
    });

    it('should not call Google Analytics on non-NavigationEnd events', () => {
        const navigationStartEvent = new NavigationStart(1, '/test-url');
        routerEventsSubject.next(navigationStartEvent);

        expect(gaFunction).not.toHaveBeenCalled();
    });

    it('should track multiple navigation events', () => {
        const event1 = new NavigationEnd(1, '/page1', '/page1');
        const event2 = new NavigationEnd(2, '/page2', '/page2');

        routerEventsSubject.next(event1);
        routerEventsSubject.next(event2);

        expect(gaFunction).toHaveBeenCalledTimes(4);
        expect(gaFunction).toHaveBeenCalledWith('set', 'page', '/page1');
        expect(gaFunction).toHaveBeenCalledWith('set', 'page', '/page2');
    });
});
