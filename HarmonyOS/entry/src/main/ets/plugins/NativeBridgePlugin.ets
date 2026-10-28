/*
 * VLStreamCloud 自研业务 Plugin（鸿蒙 ArkTS 版，与 Android/iOS 端对齐）。
 *
 * jsName = "NativeBridge"，H5 侧通过 Capacitor.Plugins.NativeBridge 统一访问。
 * 提供：
 *   - getGateway   返回后端网关地址
 *   - getAppInfo   返回应用信息（包名/appId/secret/版本）
 *   - tokenOverdue 清 H5 会话并 reload 重登
 *   - setStatusBar 动态设置状态栏背景/前景色（H5 按页面内容联动）
 *   - setImmersiveMode 全屏视频沉浸式：隐藏/恢复系统状态栏与导航栏
 *
 * 此外 handleOnPageStart 在每次页面加载时注入同步静态变量
 * window.__VL_STATIC__（vlEnv / gateway / appInfo）、运行环境标志 is_native_shell=true，
 * 以及状态栏避让区高度 window.__safeAreaTop（vp，非沉浸式窗口下为 0）。
 *
 * 通用能力（拍照、退出、定位）由官方 @capacitor-ohos/app/camera/geolocation 提供。
 */
import { CapacitorPlugin, PluginCall } from 'harmony-capacitor';
import { window } from '@kit.ArkUI';
import { BusinessError } from '@kit.BasicServicesKit';
import { MainWindowHolder } from '../common/MainWindowHolder';

// 后端环境名：multi=多租户生产 / single=单租户，域名预设表在 H5（vue3-h5/src/config/index.js）
const APP_VL_ENV: string = 'single';
// 业务网关覆盖地址（不带末尾斜杠）；留空表示沿用 H5 的环境预设，仅现场部署需要覆盖时填写
const APP_GATEWAY: string = '';
const APP_ID: string = '747aa0fa18d047c8b526e242142e0a6c';
const APP_SECRET: string = '3a97f4f65b204a3a96071746fa42936a';
const APP_LABEL: string = 'VLStreamCloud';
const APP_VERSION: string = '1.0.0';
const APP_PACKAGE: string = 'com.oort.vlstream.app';

export class NativeBridgePlugin extends CapacitorPlugin {
  // Whether an immersive fullscreen video is currently active (set by setImmersiveMode)
  private immersiveActive: boolean = false;
  constructor() {
    super();
    this.registerMethod('getGateway', (call: PluginCall): void => { this.getGateway(call); });
    this.registerMethod('getAppInfo', (call: PluginCall): void => { this.getAppInfo(call); });
    this.registerMethod('tokenOverdue', (call: PluginCall): void => { this.tokenOverdue(call); });
    this.registerMethod('setStatusBar', (call: PluginCall): void => { this.setStatusBar(call); });
    this.registerMethod('setImmersiveMode', (call: PluginCall): void => { this.setImmersiveMode(call); });
  }

  /** 每次页面开始加载时注入同步静态变量与运行环境标志。 */
  handleOnPageStart(): void {
    const appInfo: Record<string, string> = {
      'apppackage': APP_PACKAGE,
      'app_id': APP_ID,
      'app_secret': APP_SECRET,
      'applabel': APP_LABEL,
      'version': APP_VERSION
    };
    const appInfoJson: string = JSON.stringify(appInfo);
    const vlEnvJson: string = JSON.stringify(APP_VL_ENV);
    const gatewayJson: string = JSON.stringify(APP_GATEWAY);
    const safeTop: number = this.getSafeAreaTopVp();
    const js: string =
      '(function(){try{' +
      'window.global=window.global||{};' +
      'window.global.is_native_shell=true;' +
      'window.global.is_cordova=false;' +
      'window.global.is_phone=true;' +
      'window.global.is_harmony=true;' +
      'window.__VL_STATIC__={"vlEnv":' + vlEnvJson + ',"gateway":' + gatewayJson + ',"appInfo":' + appInfoJson + '};' +
      'window.__safeAreaTop=' + safeTop + ';' +
      '}catch(e){console.error("[NativeBridgePlugin] inject failed",e);}})();';
    try {
      this.cordovaWebView?.getWebviewController().runJavaScript(js);
    } catch (e) {
      console.error('[NativeBridgePlugin] handleOnPageStart failed: ' + (e as Error).message);
    }
  }

  /** 返回网关地址（H5 启动期已同步拿到，此为兜底入口）。 */
  getGateway(call: PluginCall): void {
    const ret: Record<string, string> = { 'gateway': APP_GATEWAY };
    call.resolve(ret);
  }

  /** 返回应用信息。 */
  getAppInfo(call: PluginCall): void {
    const ret: Record<string, string> = {
      'apppackage': APP_PACKAGE,
      'app_id': APP_ID,
      'app_secret': APP_SECRET,
      'applabel': APP_LABEL,
      'version': APP_VERSION
    };
    call.resolve(ret);
  }

  /** Token 失效：清 H5 sessionStorage 并 reload。 */
  tokenOverdue(call: PluginCall): void {
    const js: string =
      "(function(){try{" +
      "sessionStorage.removeItem('token');" +
      "sessionStorage.removeItem('tempObj');" +
      "sessionStorage.removeItem('tenantId');" +
      "sessionStorage.removeItem('autoLogin');" +
      "}catch(e){}" +
      "window.location.hash='';" +
      "location.replace(location.href.split('#')[0]);" +
      "})();";
    try {
      this.cordovaWebView?.getWebviewController().runJavaScript(js);
    } catch (e) {
      console.error('[NativeBridgePlugin] tokenOverdue failed: ' + (e as Error).message);
    }
    call.resolve();
  }

  /**
   * 取状态栏高度（vp）。EntryAbility.onCreate 已把避让区高度存入
   * AppStorage('__safeAreaTop')，这里读取注入 H5。
   */
  getSafeAreaTopVp(): number {
    const v: number = AppStorage.get<number>('__safeAreaTop') ?? 0;
    return v;
  }

  /**
   * 动态设置状态栏背景/前景色，使状态栏与紧邻其下的 H5 内容颜色一致。
   * 参数：color（背景，默认 #F9FAFF）、contentColor（图标/文字，默认 #000000）。
   */
  setStatusBar(call: PluginCall): void {
    const color: string = call.getString('color', '#F9FAFF');
    const contentColor: string = call.getString('contentColor', '#000000');
    const win: window.Window | null = MainWindowHolder.get();
    if (!win) {
      call.rejectMessage('no-window', 'main window is not available yet');
      return;
    }
    const barProps: window.SystemBarProperties = {
      statusBarColor: color,
      statusBarContentColor: contentColor
    };
    win.setWindowSystemBarProperties(barProps).then((): void => {
      call.resolve();
    }).catch((e: BusinessError): void => {
      call.rejectMessage('set-failed', e.message);
    });
  }

  /**
   * 全屏视频沉浸式开关。
   * enabled=true：窗口切全屏布局并隐藏状态栏/导航栏，视频铺满整屏；
   * enabled=false：恢复系统栏可见并退出全屏布局，窗口重新避让状态栏。
   * 注意 setWindowSystemBarEnable 仅在全屏布局窗口下生效，需先设置布局模式。
   */
  setImmersiveMode(call: PluginCall): void {
    const enabled: boolean = call.getBoolean('enabled', false);
    const win: window.Window | null = MainWindowHolder.get();
    if (!win) {
      call.rejectMessage('no-window', 'main window is not available yet');
      return;
    }
    let chain: Promise<void>;
    if (enabled) {
      // Fullscreen layout first, then hide the system bars so the video fills the screen
      chain = win.setWindowLayoutFullScreen(true).then((): Promise<void> => {
        return win.setWindowSystemBarEnable([]);
      });
    } else {
      chain = this.restoreSystemBars(win);
    }
    chain.then((): void => {
      this.immersiveActive = enabled;
      call.resolve();
    }).catch((e: BusinessError): void => {
      call.rejectMessage('set-failed', e.message);
    });
  }

  /** Whether an immersive fullscreen video is currently active. */
  isImmersiveActive(): boolean {
    return this.immersiveActive;
  }

  /**
   * 返回手势落在沉浸式全屏视频上时：恢复系统栏，并通知 H5 退出全屏
   * （document.exitFullscreen + vl-exit-fullscreen 事件，覆盖 API 全屏与 CSS 兜底全屏）。
   */
  exitImmersiveAndNotifyH5(): void {
    this.immersiveActive = false;
    const win: window.Window | null = MainWindowHolder.get();
    if (win) {
      this.restoreSystemBars(win).catch((): void => {
      });
    }
    const js: string =
      '(function(){try{' +
      'if(document.fullscreenElement&&document.exitFullscreen){document.exitFullscreen();}' +
      'document.dispatchEvent(new Event("vl-exit-fullscreen"));' +
      '}catch(e){}})();';
    try {
      this.cordovaWebView?.getWebviewController().runJavaScript(js);
    } catch (e) {
      console.error('[NativeBridgePlugin] exitImmersiveAndNotifyH5 failed: ' + (e as Error).message);
    }
  }

  /** Restore bar visibility while still in fullscreen layout, then leave fullscreen layout. */
  private restoreSystemBars(win: window.Window): Promise<void> {
    return win.setWindowSystemBarEnable(['status', 'navigation']).then((): Promise<void> => {
      return win.setWindowLayoutFullScreen(false);
    });
  }
}
