import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { SettingsServiceStub } from '../../../testing/settings.service.stub';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ItemComponent],
      providers: [{ provide: SettingsService, useClass: SettingsServiceStub }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hasUrl should be true for absolute urls', () => {
    component.item = { url: 'https://example.com' } as Story;
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl should be false for internal item links', () => {
    component.item = { url: 'item?id=1' } as Story;
    expect(component.hasUrl).toBe(false);
  });
});
