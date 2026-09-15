import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  it('toggles the settings panel', () => {
    const initial = service.settings.showSettings;
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(!initial);
  });

  it('persists the selected theme', () => {
    service.setTheme('amoled');
    expect(service.settings.theme).toBe('amoled');
    expect(localStorage.getItem('theme')).toBe('amoled');
  });

  it('persists the title font size and list spacing', () => {
    service.setFont('20');
    service.setSpacing('4');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
    expect(localStorage.getItem('listSpacing')).toBe('4');
  });
});
