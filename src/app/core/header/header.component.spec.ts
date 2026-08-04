import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsServiceStub } from '../../../testing/settings.service.stub';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let settings: SettingsServiceStub;

  beforeEach(() => {
    settings = new SettingsServiceStub();

    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [{ provide: SettingsService, useValue: settings }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggleSettings should flip the settings panel visibility', () => {
    expect(settings.settings.showSettings).toBe(false);
    component.toggleSettings();
    expect(settings.settings.showSettings).toBe(true);
  });
});
