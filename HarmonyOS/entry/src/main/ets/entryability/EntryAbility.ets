import { AbilityConstant, UIAbility, Want } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { window } from '@kit.ArkUI';
import { webview } from '@kit.ArkWeb';
import { display } from '@kit.ArkUI';
import { BusinessError } from '@kit.BasicServicesKit';

const DOMAIN: number = 0x0000;
const TAG: string = 'VLStream';

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    hilog.info(DOMAIN, TAG, '%{public}s', 'Ability onCreate');
    webview.WebviewController.initializeWebEngine();
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    // Non-immersive: the window avoids the status bar so H5 content never draws under it
    try {
      const mainWin: window.Window = windowStage.getMainWindowSync();
      mainWin.setWindowLayoutFullScreen(false);
      // Light status bar background with dark icons, matching the H5 page background
      const barProps: window.SystemBarProperties = {
        statusBarColor: '#F9FAFF',
        statusBarContentColor: '#000000'
      };
      mainWin.setWindowSystemBarProperties(barProps);
      // Store the status bar avoid-area height (vp) in AppStorage for the plugin to inject into H5 (0 when not fullscreen)
      const avoid: window.AvoidArea = mainWin.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM);
      const topPx: number = avoid.topRect.height;
      // Convert px to vp using the display density (pixels per vp)
      const density: number = display.getDefaultDisplaySync().densityPixels;
      const topVp: number = density > 0 ? topPx / density : 0;
      AppStorage.setOrCreate<number>('__safeAreaTop', topVp);
    } catch (e) {
      const err: BusinessError = e as BusinessError;
      hilog.warn(DOMAIN, TAG, 'status bar adapt failed: %{public}s', err.message);
    }

    windowStage.loadContent('pages/Index', (err: BusinessError): void => {
      if (err.code) {
        hilog.error(DOMAIN, TAG, 'loadContent failed: %{public}s', err.message);
      }
    });
  }
}
