import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';

describe('ItemDetailsComponent', () => {
    let component: ItemDetailsComponent;
    let fixture: ComponentFixture<ItemDetailsComponent>;
    let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;
    let mockLocation: jasmine.SpyObj<Location>;
    let mockActivatedRoute: any;

    beforeEach(async () => {
        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);
        mockLocation = jasmine.createSpyObj('Location', ['back']);
        mockSettingsService = jasmine.createSpyObj('SettingsService', []);
        mockSettingsService.settings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0'
        };

        mockActivatedRoute = {
            params: of({ id: '123' })
        };

        await TestBed.configureTestingModule({
            declarations: [ItemDetailsComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Location, useValue: mockLocation }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ItemDetailsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should inject settings from SettingsService', () => {
        expect(component.settings).toEqual(mockSettingsService.settings);
    });

    it('should fetch item content on ngOnInit', () => {
        const mockStory: Story = {
            id: 123,
            title: 'Test Story',
            url: 'http://example.com'
        } as Story;
        mockHackerNewsAPIService.fetchItemContent.and.returnValue(of(mockStory));
        spyOn(window, 'scrollTo');

        component.ngOnInit();

        expect(mockHackerNewsAPIService.fetchItemContent).toHaveBeenCalledWith(123);
        expect(component.item).toEqual(mockStory);
    });

    it('should scroll to top on ngOnInit', () => {
        const mockStory: Story = { id: 123, title: 'Test' } as Story;
        mockHackerNewsAPIService.fetchItemContent.and.returnValue(of(mockStory));
        spyOn(window, 'scrollTo');

        component.ngOnInit();

        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should set error message on API failure', () => {
        mockHackerNewsAPIService.fetchItemContent.and.returnValue(throwError('Network error'));
        spyOn(window, 'scrollTo');

        component.ngOnInit();

        expect(component.errorMessage).toBe('Could not load item comments.');
    });

    it('should call Location.back when goBack is called', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should return true for hasUrl when URL starts with http', () => {
        component.item = { url: 'http://example.com' } as Story;
        expect(component.hasUrl).toBe(true);
    });

    it('should return true for hasUrl when URL starts with https', () => {
        component.item = { url: 'https://example.com' } as Story;
        expect(component.hasUrl).toBe(true);
    });

    it('should return false for hasUrl when URL does not start with http', () => {
        component.item = { url: 'item?id=123' } as Story;
        expect(component.hasUrl).toBe(false);
    });
});
