/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 11:05:56
* @Last Modified by:   兰舰
* @Last Modified time: 2024-11-15 11:05:56
* @Copyright aPaaS-front-team. All rights reserved.
*/
export function adjustColorOpacity(color, alpha) {
  alpha = Math.max(0, Math.min(1, alpha)); // 确保透明度在 [0,1] 范围内
  let r, g, b;

  // 解析 RGBA 格式（如 rgba(255, 100, 50, 0.7)）
  if (/^rgba?\(/i.test(color)) {
    const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
    if (!match) throw new Error('Invalid RGB/RGBA format');

    [r, g, b] = match.slice(1, 4).map(Number);
    if (match[4] !== undefined) {
      // 如果颜色自带 alpha 且未传入参数，则使用颜色自带的 alpha
      alpha = typeof alpha === 'undefined' ? parseFloat(match[4]) : alpha;
    }
  }
  // 解析 HEX 格式（如 #F05A1F 或 #F05）
  else if (color.startsWith('#')) {
    let hex = color.replace(/^#/, '');
    // 处理短格式（如 #F05 → FF0055）
    if (hex.length === 3) hex = hex.replace(/./g, '$&$&');
    if (hex.length !== 6) throw new Error('Invalid HEX format');

    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  else {
    throw new Error('Unsupported color format');
  }

  // 混合计算函数（白色背景）
  const blend = (channel) => Math.round(channel * alpha + 255 * (1 - alpha));

  // 将结果转换为两位十六进制（大写）
  const toHex = (val) => {
    const clamped = Math.max(0, Math.min(255, val));
    return clamped.toString(16).padStart(2, '0').toUpperCase();
  };
  return `#${toHex(blend(r))}${toHex(blend(g))}${toHex(blend(b))}`;
}

//
/**
 * 设置主题颜色
 * 该函数通过修改CSS变量来更新页面上的主题颜色
 * 主要应用于使页面的默认颜色方案与用户选择的主题颜色保持一致
 *
 * @param color 主题颜色值，目前未使用（应更新参数描述）
 */
export function setThemeColors(themeColor) {

    // 设置主色调
    document.documentElement.style.setProperty('--el-color-primary', themeColor)
    // 设置主色调的较浅版本，用于悬停效果等
    document.documentElement.style.setProperty('--el-color-primary-light-3', adjustColorOpacity(themeColor, 0.7))
    // 设置菜单悬停背景颜色
    document.documentElement.style.setProperty('--el-menu-hover-bg-color', adjustColorOpacity(themeColor, 0.04))
    // 鼠标按下的颜色
    document.documentElement.style.setProperty('--el-color-primary-dark-2', adjustColorOpacity(themeColor, 0.5))
    // tag的背景色
     document.documentElement.style.setProperty('--el-color-primary-light-9', adjustColorOpacity(themeColor, 0.03))
     document.documentElement.style.setProperty('--el-color-primary-light-8', adjustColorOpacity(themeColor, 0.05))
     document.documentElement.style.setProperty('--el-color-primary-hb', adjustColorOpacity(themeColor, 0.1))
     document.documentElement.style.setProperty('--el-color-primary-hb2', adjustColorOpacity(themeColor, 0.2))

  /* disable 的颜色*/
    //   --el-color-primary-light-5: #CC0200 !important;
    // 统一的圆角
    document.documentElement.style.setProperty('--common-border-radius', '6px')
}
