import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { SettingsServiceStub } from '../testing/settings.service.stub';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(() => {
    (window as any).ga = () => {};

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: SettingsService, useClass: SettingsServiceStub },
        { provide: Router, useValue: { events: EMPTY } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should expose settings from the SettingsService', () => {
    expect(component.settings).toBeDefined();
    expect(component.settings.theme).toBe('default');
  });
});
