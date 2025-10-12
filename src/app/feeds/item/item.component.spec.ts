import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
    let component: ItemComponent;
    let fixture: ComponentFixture<ItemComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;

    beforeEach(async () => {
        mockSettingsService = jasmine.createSpyObj('SettingsService', []);
        mockSettingsService.settings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0'
        };

        await TestBed.configureTestingModule({
            declarations: [ItemComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ItemComponent);
        component = fixture.componentInstance;
        component.item = {
            id: 1,
            title: 'Test Story',
            url: 'http://example.com',
            points: 100
        } as Story;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should inject settings from SettingsService', () => {
        expect(component.settings).toEqual(mockSettingsService.settings);
    });

    it('should return true for hasUrl when URL starts with http', () => {
        component.item.url = 'http://example.com';
        expect(component.hasUrl).toBe(true);
    });

    it('should return true for hasUrl when URL starts with https', () => {
        component.item.url = 'https://example.com';
        expect(component.hasUrl).toBe(true);
    });

    it('should return false for hasUrl when URL does not start with http', () => {
        component.item.url = 'item?id=123';
        expect(component.hasUrl).toBe(false);
    });

    it('should initialize', () => {
        component.ngOnInit();
        expect(component).toBeTruthy();
    });
});
