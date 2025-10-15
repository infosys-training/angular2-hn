import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let localStorageGetItemSpy: jasmine.Spy;
  let localStorageSetItemSpy: jasmine.Spy;

  beforeEach(() => {
    const settingsServiceMock = jasmine.createSpyObj('SettingsService', [
      'setTheme',
      'setFont',
      'setSpacing',
      'toggleSettings',
      'toggleOpenLinksInNewTab'
    ]);

    settingsServiceMock.settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };

    localStorageGetItemSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    localStorageSetItemSpy = spyOn(localStorage, 'setItem');

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [
        { provide: SettingsService, useValue: settingsServiceMock }
      ]
    });

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    settingsServiceSpy = TestBed.inject(SettingsService) as jasmine.SpyObj<SettingsService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Negative Tests for selectTheme()', () => {
    it('should accept invalid theme name not in allowed list', () => {
      const invalidTheme = 'invalid-theme';
      component.selectTheme(invalidTheme);
      expect(settingsServiceSpy.setTheme).toHaveBeenCalledWith(invalidTheme);
    });

    it('should accept another invalid theme name', () => {
      const invalidTheme = 'blue';
      component.selectTheme(invalidTheme);
      expect(settingsServiceSpy.setTheme).toHaveBeenCalledWith(invalidTheme);
    });

    it('should accept yet another invalid theme name', () => {
      const invalidTheme = 'red';
      component.selectTheme(invalidTheme);
      expect(settingsServiceSpy.setTheme).toHaveBeenCalledWith(invalidTheme);
    });

    it('should accept null value', () => {
      component.selectTheme(null);
      expect(settingsServiceSpy.setTheme).toHaveBeenCalledWith(null);
    });

    it('should accept undefined value', () => {
      component.selectTheme(undefined);
      expect(settingsServiceSpy.setTheme).toHaveBeenCalledWith(undefined);
    });

    it('should accept empty string', () => {
      component.selectTheme('');
      expect(settingsServiceSpy.setTheme).toHaveBeenCalledWith('');
    });

    it('should accept special characters', () => {
      const invalidTheme = '<script>';
      component.selectTheme(invalidTheme);
      expect(settingsServiceSpy.setTheme).toHaveBeenCalledWith(invalidTheme);
    });

    it('should accept path traversal attempt', () => {
      const invalidTheme = '../../etc/passwd';
      component.selectTheme(invalidTheme);
      expect(settingsServiceSpy.setTheme).toHaveBeenCalledWith(invalidTheme);
    });
  });

  describe('Negative Tests for changeTitleFont()', () => {
    it('should accept negative number -5', () => {
      const invalidFontSize = -5;
      component.changeTitleFont(invalidFontSize);
      expect(settingsServiceSpy.setFont).toHaveBeenCalledWith(invalidFontSize);
    });

    it('should accept negative number -100', () => {
      const invalidFontSize = -100;
      component.changeTitleFont(invalidFontSize);
      expect(settingsServiceSpy.setFont).toHaveBeenCalledWith(invalidFontSize);
    });

    it('should accept zero which is below min constraint of 1', () => {
      const invalidFontSize = 0;
      component.changeTitleFont(invalidFontSize);
      expect(settingsServiceSpy.setFont).toHaveBeenCalledWith(invalidFontSize);
    });

    it('should accept non-numeric string abc', () => {
      const invalidFontSize = 'abc';
      component.changeTitleFont(invalidFontSize);
      expect(settingsServiceSpy.setFont).toHaveBeenCalledWith(invalidFontSize);
    });

    it('should accept non-numeric string 12px', () => {
      const invalidFontSize = '12px';
      component.changeTitleFont(invalidFontSize);
      expect(settingsServiceSpy.setFont).toHaveBeenCalledWith(invalidFontSize);
    });

    it('should accept non-numeric string large', () => {
      const invalidFontSize = 'large';
      component.changeTitleFont(invalidFontSize);
      expect(settingsServiceSpy.setFont).toHaveBeenCalledWith(invalidFontSize);
    });

    it('should accept extremely large value 999999', () => {
      const invalidFontSize = 999999;
      component.changeTitleFont(invalidFontSize);
      expect(settingsServiceSpy.setFont).toHaveBeenCalledWith(invalidFontSize);
    });

    it('should accept null value', () => {
      component.changeTitleFont(null);
      expect(settingsServiceSpy.setFont).toHaveBeenCalledWith(null);
    });

    it('should accept undefined value', () => {
      component.changeTitleFont(undefined);
      expect(settingsServiceSpy.setFont).toHaveBeenCalledWith(undefined);
    });

    it('should accept empty string', () => {
      component.changeTitleFont('');
      expect(settingsServiceSpy.setFont).toHaveBeenCalledWith('');
    });
  });

  describe('Negative Tests for changeSpacing()', () => {
    it('should accept negative number -10', () => {
      const invalidSpacing = -10;
      component.changeSpacing(invalidSpacing);
      expect(settingsServiceSpy.setSpacing).toHaveBeenCalledWith(invalidSpacing);
    });

    it('should accept negative number -50', () => {
      const invalidSpacing = -50;
      component.changeSpacing(invalidSpacing);
      expect(settingsServiceSpy.setSpacing).toHaveBeenCalledWith(invalidSpacing);
    });

    it('should accept non-numeric string abc', () => {
      const invalidSpacing = 'abc';
      component.changeSpacing(invalidSpacing);
      expect(settingsServiceSpy.setSpacing).toHaveBeenCalledWith(invalidSpacing);
    });

    it('should accept non-numeric string 10px', () => {
      const invalidSpacing = '10px';
      component.changeSpacing(invalidSpacing);
      expect(settingsServiceSpy.setSpacing).toHaveBeenCalledWith(invalidSpacing);
    });

    it('should accept extremely large value 999999', () => {
      const invalidSpacing = 999999;
      component.changeSpacing(invalidSpacing);
      expect(settingsServiceSpy.setSpacing).toHaveBeenCalledWith(invalidSpacing);
    });

    it('should accept null value', () => {
      component.changeSpacing(null);
      expect(settingsServiceSpy.setSpacing).toHaveBeenCalledWith(null);
    });

    it('should accept undefined value', () => {
      component.changeSpacing(undefined);
      expect(settingsServiceSpy.setSpacing).toHaveBeenCalledWith(undefined);
    });

    it('should accept empty string', () => {
      component.changeSpacing('');
      expect(settingsServiceSpy.setSpacing).toHaveBeenCalledWith('');
    });
  });
});
