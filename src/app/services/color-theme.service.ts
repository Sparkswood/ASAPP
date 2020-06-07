import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorThemeService {

  private _isDark: boolean;

  constructor() { }

  get isDark() {
    return this._isDark;
  }

  checkDeviceTheme() {
    this.toggleDarkTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  toggleDarkTheme(toToggle: boolean) {
    this._isDark = toToggle;

    this._isDark ? document.body.classList.toggle('dark') : document.body.classList.remove('dark');
  }

}
