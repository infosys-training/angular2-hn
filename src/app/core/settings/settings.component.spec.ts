import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsServiceStub } from '../../../testing/settings.service.stub';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;
  let settings: SettingsServiceStub;

  beforeEach(() => {
    settings = new SettingsServiceStub();

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settings }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selectTheme should update the active theme', () => {
    component.selectTheme('night');
    expect(settings.settings.theme).toBe('night');
  });

  it('toggleOpenLinksInNewTab should flip the preference', () => {
    expect(settings.settings.openLinkInNewTab).toBe(false);
    component.toggleOpenLinksInNewTab();
    expect(settings.settings.openLinkInNewTab).toBe(true);
  });
});
