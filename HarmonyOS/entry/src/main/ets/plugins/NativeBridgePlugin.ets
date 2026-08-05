/*
 * VLStreamCloud 自研业务 Plugin（鸿蒙 ArkTS 版，与 Android/iOS 端对齐）。
 *
 * jsName = "NativeBridge"，H5 侧通过 Capacitor.Plugins.NativeBridge 统一访问。
 * 提供：
 *   - getGateway   返回后端网关地址
 *   - getAppInfo   返回应用信息（包名/appId/secret/版本）
 *   - tokenOverdue 清 H5 会话并 reload 重登
 *
 * 此外 handleOnPageStart 在每次页面加载时注入同步静态变量
 * window.__VL_STATIC__（gateway / appInfo）、运行环境标志 is_native_shell=true，
 * 以及沉浸式状态栏安全区高度 window.__safeAreaTop（vp），供 H5 顶部精确留白。
 *
 * 通用能力（拍照、退出、定位）由官方 @capacitor-ohos/app/camera/geolocation 提供。
 */
import { CapacitorPlugin, PluginCall } from 'harmony-capacitor';

const APP_GATEWAY: string = 'https://workup-dev.myoumuamua.com:6433';
const APP_ID: string = '747aa0fa18d047c8b526e242142e0a6c';
const APP_SECRET: string = '3a97f4f65b204a3a96071746fa42936a';
const APP_LABEL: string = 'VLStreamCloud';
const APP_VERSION: string = '1.0.0';
const APP_PACKAGE: string = 'com.oort.vlstream.app';

export class NativeBridgePlugin extends CapacitorPlugin {
  constructor() {
    super();
    this.registerMethod('getGateway', (call: PluginCall): void => { this.getGateway(call); });
    this.registerMethod('getAppInfo', (call: PluginCall): void => { this.getAppInfo(call); });
    this.registerMethod('tokenOverdue', (call: PluginCall): void => { this.tokenOverdue(call); });
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
    const gatewayJson: string = JSON.stringify(APP_GATEWAY);
    const safeTop: number = this.getSafeAreaTopVp();
    const js: string =
      '(function(){try{' +
      'window.global=window.global||{};' +
      'window.global.is_native_shell=true;' +
      'window.global.is_cordova=false;' +
      'window.global.is_phone=true;' +
      'window.global.is_harmony=true;' +
      'window.__VL_STATIC__={"gateway":' + gatewayJson + ',"appInfo":' + appInfoJson + '};' +
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
}
