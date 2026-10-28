import { MainPage, pageBackPress, pageHideEvent, pageShowEvent, MainPageOnBackPress, PluginEntry } from 'harmony-capacitor';
import { common } from '@kit.AbilityKit';
import { NativeBridgePlugin } from '../plugins/NativeBridgePlugin';

@Entry
@Component
struct Index {
  // Wire this instance into MainPage (backPress param) so the gesture back
  // reaches the H5 history instead of always falling through to exit.
  mainPageOnBackPress: MainPageOnBackPress = new MainPageOnBackPress();

  // Self-developed bridge plugin instance, kept as a member so onBackPress can
  // ask it whether an immersive fullscreen video is active.
  nativeBridge: NativeBridgePlugin = new NativeBridgePlugin();

  // 自研业务 plugin：与 Android/iOS 端对齐（getGateway/getAppInfo/tokenOverdue + 启动注入）
  capacitorPlugins: Array<PluginEntry> = [
    {
      pluginName: 'NativeBridge',
      pluginObject: this.nativeBridge
    }
  ];

  // Timestamp of the last back press on the home page (double-press to exit)
  private lastBackPressTime: number = 0;

  onPageShow(): void {
    pageShowEvent();
  }

  onBackPress(): boolean {
    pageBackPress();
    // While a fullscreen video is immersive, back first leaves fullscreen
    if (this.nativeBridge.isImmersiveActive()) {
      this.nativeBridge.exitImmersiveAndNotifyH5();
      return true;
    }
    // Forward the back gesture to the H5 (goes back one page when history exists)
    if (this.mainPageOnBackPress.backPress()) {
      return true;
    }
    // Home page: a second back press within 2s moves the app to the background
    const now: number = Date.now();
    if (now - this.lastBackPressTime < 2000) {
      this.lastBackPressTime = 0;
      const ctx = this.getUIContext().getHostContext() as common.UIAbilityContext;
      ctx.moveAbilityToBackground();
    } else {
      this.lastBackPressTime = now;
      this.getUIContext().getPromptAction().showToast({ message: '再按一次退出应用', duration: 2000 });
    }
    return true;
  }

  onPageHide(): void {
    pageHideEvent();
  }

  build(): void {
    RelativeContainer() {
      // 默认加载 rawfile/www/index.html（vue3-h5 离线包）；
      // backPress 传入 MainPage，由其在 aboutToAppear 里绑定 webview 的历史回退
      MainPage({ isWebDebug: false, capacitorPlugins: this.capacitorPlugins, backPress: this.mainPageOnBackPress });
    }
    .height('100%')
    .width('100%')
  }
}
