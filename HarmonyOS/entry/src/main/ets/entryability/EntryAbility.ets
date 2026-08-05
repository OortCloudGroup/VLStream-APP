import { AbilityConstant, UIAbility, Want } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { window } from '@kit.ArkUI';
import { webview } from '@kit.ArkWeb';

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    hilog.info(0x0000, 'VLStream', '%{public}s', 'Ability onCreate');
    webview.WebviewController.initializeWebEngine();

    // 沉浸式状态栏：取系统状态栏高度（px）换算为 vp，挂到 globalThis 供插件读取
    try {
      const win = window.getLastWindow(this.context);
      const avoid = win.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM);
      const scale = win.getWindowProperties().pixelRatio;
      const topPx = avoid.topRect.height;
      const topVp = scale > 0 ? Math.round(topPx / scale) : 0;
      (globalThis as Record<string, number>)['__safeAreaTop'] = topVp;
    } catch (e) {
      hilog.warn(0x0000, 'VLStream', 'get status bar height failed: %{public}s', (e as Error).message);
    }
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    // 沉浸式：内容延伸到状态栏
    try {
      const win = windowStage.getMainWindow();
      win.setWindowLayoutFullScreen(true);
    } catch (e) {
      hilog.warn(0x0000, 'VLStream', 'setWindowLayoutFullScreen failed: %{public}s', (e as Error).message);
    }
    windowStage.loadContent('pages/Index', (err): void => {
      if (err.code) {
        hilog.error(0x0000, 'VLStream', 'loadContent failed: %{public}s', JSON.stringify(err));
      }
    });
  }
}
