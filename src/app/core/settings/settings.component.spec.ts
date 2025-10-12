import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
    let component: SettingsComponent;
    let fixture: ComponentFixture<SettingsComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;

    beforeEach(async () => {
        mockSettingsService = jasmine.createSpyObj('SettingsService', [
            'toggleSettings',
            'toggleOpenLinksInNewTab',
            'setTheme',
            'setFont',
            'setSpacing'
        ]);
        mockSettingsService.settings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0'
        };

        await TestBed.configureTestingModule({
            declarations: [SettingsComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should inject settings from SettingsService', () => {
        expect(component.settings).toEqual(mockSettingsService.settings);
    });

    it('should call SettingsService toggleSettings when closeSettings is called', () => {
        component.closeSettings();
        expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
    });

    it('should call SettingsService toggleOpenLinksInNewTab when toggleOpenLinksInNewTab is called', () => {
        component.toggleOpenLinksInNewTab();
        expect(mockSettingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    });

    it('should call SettingsService setTheme when selectTheme is called', () => {
        component.selectTheme('night');
        expect(mockSettingsService.setTheme).toHaveBeenCalledWith('night');
    });

    it('should call SettingsService setFont when changeTitleFont is called', () => {
        component.changeTitleFont('18');
        expect(mockSettingsService.setFont).toHaveBeenCalledWith('18');
    });

    it('should call SettingsService setSpacing when changeSpacing is called', () => {
        component.changeSpacing('5');
        expect(mockSettingsService.setSpacing).toHaveBeenCalledWith('5');
    });

    it('should initialize', () => {
        component.ngOnInit();
        expect(component).toBeTruthy();
    });
});
