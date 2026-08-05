import { MainPage, pageBackPress, pageHideEvent, pageShowEvent, MainPageOnBackPress, PluginEntry } from 'harmony-capacitor';
import { NativeBridgePlugin } from '../plugins/NativeBridgePlugin';

@Entry
@Component
struct Index {
  // 自研业务 plugin：与 Android/iOS 端对齐（getGateway/getAppInfo/tokenOverdue + 启动注入）
  capacitorPlugins: Array<PluginEntry> = [
    {
      pluginName: 'NativeBridge',
      pluginObject: new NativeBridgePlugin()
    }
  ];

  mainPageOnBackPress: MainPageOnBackPress = new MainPageOnBackPress();

  onPageShow(): void {
    pageShowEvent();
  }

  onBackPress(): boolean {
    // 返回键交给框架处理（H5 历史回退/退出）
    pageBackPress();
    return this.mainPageOnBackPress.backPress();
  }

  onPageHide(): void {
    pageHideEvent();
  }

  build(): void {
    RelativeContainer() {
      // 默认加载 rawfile/www/index.html（vue3-h5 离线包）
      MainPage({ isWebDebug: false, capacitorPlugins: this.capacitorPlugins });
    }
    .height('100%')
    .width('100%')
  }
}
