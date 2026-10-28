/*
 * Holds a reference to the app main window so classes outside the ability
 * (e.g. Capacitor plugins) can adjust window properties such as the status
 * bar color. EntryAbility stores the window in onWindowStageCreate.
 */
import { window } from '@kit.ArkUI';

export class MainWindowHolder {
  private static mainWindow: window.Window | null = null;

  static set(win: window.Window): void {
    MainWindowHolder.mainWindow = win;
  }

  static get(): window.Window | null {
    return MainWindowHolder.mainWindow;
  }
}
