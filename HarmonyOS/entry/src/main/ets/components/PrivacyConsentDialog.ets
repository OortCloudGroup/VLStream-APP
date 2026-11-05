/*
 * 首启隐私政策弹窗（华为应用市场审核要求）
 * 同意前应用不创建 Web 组件、不加载任何页面内容；
 * 协议链接跳转系统浏览器打开。
 */
import { common } from '@kit.AbilityKit';
import { BusinessError } from '@kit.BasicServicesKit';

const PRIVACY_POLICY_URL: string = 'https://oortcloudsmart.com/privacypolicy_vlstream.html';

@Component
export struct PrivacyConsentDialog {
  onAgree: () => void = (): void => {};
  onDisagree: () => void = (): void => {};

  private openPrivacyPolicy(): void {
    const ctx: common.UIAbilityContext | undefined = this.getUIContext().getHostContext() as common.UIAbilityContext;
    if (!ctx) {
      return;
    }
    try {
      ctx.openLink(PRIVACY_POLICY_URL, { appLinkingOnly: false });
    } catch (e) {
      const err: BusinessError = e as BusinessError;
      console.error(`openPrivacyPolicy failed, code: ${err.code}, message: ${err.message}`);
    }
  }

  build(): void {
    Stack() {
      // 半透明遮罩：点击不关闭，必须显式选择同意/不同意
      Column()
        .width('100%')
        .height('100%')
        .backgroundColor('rgba(0, 0, 0, 0.6)')

      Column() {
        Text('用户协议与隐私政策')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#333333')
          .margin({ top: 24, bottom: 16 })

        Scroll() {
          Column() {
            Text('感谢您使用VLStream。在您开始使用本应用前，请仔细阅读并充分理解')
              .fontSize(14)
              .fontColor('#666666')
              .lineHeight(22)
            Text('《用户协议和隐私政策》')
              .fontSize(14)
              .fontColor('#2f69f8')
              .margin({ top: 2, bottom: 2 })
              .onClick(() => {
                this.openPrivacyPolicy();
              })
            Text('的全部内容。为了向您提供设备管理、实时视频预览与录像回放等服务，我们将在您使用过程中收集和处理必要的设备信息、音视频数据等信息。未经您的同意，我们不会收集或使用上述信息。')
              .fontSize(14)
              .fontColor('#666666')
              .lineHeight(22)
            Text('如您同意以上协议内容，请点击"同意并继续"开始使用本应用。')
              .fontSize(14)
              .fontColor('#666666')
              .lineHeight(22)
              .margin({ top: 4 })
          }
          .alignItems(HorizontalAlign.Start)
          .constraintSize({ maxHeight: 240 })
          .padding({ left: 24, right: 24 })
        }
        .align(Alignment.Center)
        .scrollBar(BarState.Off)
        .width('100%')
        .constraintSize({ maxHeight: 240 })

        Row({ space: 12 }) {
          Button('不同意')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#666666')
            .backgroundColor('#F2F3F5')
            .borderRadius(22)
            .height(44)
            .layoutWeight(1)
            .onClick(() => {
              this.onDisagree();
            })
          Button('同意并继续')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FFFFFF')
            .backgroundColor('#2f69f8')
            .borderRadius(22)
            .height(44)
            .layoutWeight(1)
            .onClick(() => {
              this.onAgree();
            })
        }
        .width('100%')
        .padding({ left: 24, right: 24, top: 20, bottom: 24 })
      }
      .width('88%')
      .constraintSize({ maxHeight: '80%' })
      .borderRadius(16)
      .backgroundColor('#FFFFFF')
      .alignItems(HorizontalAlign.Center)
    }
    .width('100%')
    .height('100%')
  }
}
