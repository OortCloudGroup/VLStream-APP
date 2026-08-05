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
    // 沉浸式：内容延伸到状态栏，并把状态栏高度(vp)存 AppStorage 供 plugin 读取
    try {
      const mainWin: window.Window = windowStage.getMainWindowSync();
      mainWin.setWindowLayoutFullScreen(true);
      const avoid: window.AvoidArea = mainWin.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM);
      const topPx: number = avoid.topRect.height;
      // 用 display 的 densityPixels（pixels per vp）换算 vp
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
