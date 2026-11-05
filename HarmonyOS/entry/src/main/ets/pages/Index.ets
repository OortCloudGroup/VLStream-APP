import { MainPage, pageBackPress, pageHideEvent, pageShowEvent, MainPageOnBackPress, PluginEntry } from 'harmony-capacitor';
import { common } from '@kit.AbilityKit';
import { preferences } from '@kit.ArkData';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { NativeBridgePlugin } from '../plugins/NativeBridgePlugin';
import { PrivacyConsentDialog } from '../components/PrivacyConsentDialog';

const DOMAIN: number = 0x0000;
const TAG: string = 'VLStream';
const PRIVACY_PREFS_NAME: string = 'vlstream_privacy';
const PRIVACY_AGREED_KEY: string = 'privacy_agreed';

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

  // 首启隐私政策：未同意前不创建 MainPage/Web 组件，不加载任何页面内容
  @State privacyAgreed: boolean = false;

  private getPrivacyPrefs(): preferences.Preferences | null {
    const ctx: common.UIAbilityContext | undefined = this.getUIContext().getHostContext() as common.UIAbilityContext;
    if (!ctx) {
      return null;
    }
    try {
      return preferences.getPreferencesSync(ctx, { name: PRIVACY_PREFS_NAME });
    } catch (e) {
      const err: BusinessError = e as BusinessError;
      hilog.warn(DOMAIN, TAG, 'get privacy prefs failed: %{public}s', err.message);
      return null;
    }
  }

  aboutToAppear(): void {
    const prefs: preferences.Preferences | null = this.getPrivacyPrefs();
    if (prefs) {
      this.privacyAgreed = prefs.getSync(PRIVACY_AGREED_KEY, 'false') === 'true';
    }
  }

  private onPrivacyAgree(): void {
    this.privacyAgreed = true;
    const prefs: preferences.Preferences | null = this.getPrivacyPrefs();
    if (prefs) {
      try {
        prefs.putSync(PRIVACY_AGREED_KEY, 'true');
        prefs.flush();
      } catch (e) {
        const err: BusinessError = e as BusinessError;
        hilog.warn(DOMAIN, TAG, 'save privacy agreement failed: %{public}s', err.message);
      }
    }
  }

  private onPrivacyDisagree(): void {
    this.getUIContext().showAlertDialog({
      message: '您需要同意《用户协议和隐私政策》才能使用本应用，是否同意并继续？',
      primaryButton: {
        value: '同意并继续',
        action: (): void => {
          this.onPrivacyAgree();
        }
      },
      secondaryButton: {
        value: '退出应用',
        fontColor: '#999999',
        action: (): void => {
          const ctx: common.UIAbilityContext | undefined =
            this.getUIContext().getHostContext() as common.UIAbilityContext;
          if (ctx) {
            ctx.terminateSelf();
          }
        }
      },
      cancel: (): void => {
      }
    });
  }

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
      // Delegate the hint text to the H5 (vl-exit-hint event) so the toast
      // follows the in-app language instead of a fixed native string.
      this.nativeBridge.notifyExitHint();
    }
    return true;
  }

  onPageHide(): void {
    pageHideEvent();
  }

  build(): void {
    Stack() {
      if (this.privacyAgreed) {
        // 默认加载 rawfile/www/index.html（vue3-h5 离线包）；
        // backPress 传入 MainPage，由其在 aboutToAppear 里绑定 webview 的历史回退
        MainPage({ isWebDebug: false, capacitorPlugins: this.capacitorPlugins, backPress: this.mainPageOnBackPress })
      } else {
        // 未同意隐私政策：仅显示品牌占位背景，不创建 Web 组件、不发起任何加载
        Column() {
          Text('VLStream')
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FFFFFF')
        }
        .width('100%')
        .height('100%')
        .backgroundColor('#2f69f8')
        .justifyContent(FlexAlign.Center)

        PrivacyConsentDialog({
          onAgree: (): void => {
            this.onPrivacyAgree();
          },
          onDisagree: (): void => {
            this.onPrivacyDisagree();
          }
        })
      }
    }
    .height('100%')
    .width('100%')
  }
}
