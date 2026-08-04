import { Settings } from '../app/shared/models/settings';

export class SettingsServiceStub {
  settings: Settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0'
  };

  toggleSettings() {
    this.settings.showSettings = !this.settings.showSettings;
  }

  toggleOpenLinksInNewTab() {
    this.settings.openLinkInNewTab = !this.settings.openLinkInNewTab;
  }

  setTheme(theme: string) {
    this.settings.theme = theme;
  }

  setFont(fontSize: string) {
    this.settings.titleFontSize = fontSize;
  }

  setSpacing(listSpace: string) {
    this.settings.listSpacing = listSpace;
  }
}
