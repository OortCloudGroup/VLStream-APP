/*
 * 沉浸式状态栏高度（CSS px）
 * Android / iOS 壳为 edge-to-edge，WebView 延伸到状态栏下方，原生注入 window.__safeAreaTop；
 * 鸿蒙壳窗口本身避让状态栏（非沉浸式），H5 不需要再留白；浏览器 / PC 调试为 0。
 */
export function getSafeAreaTop(): number {
  const g = window.global
  if (!g || !g.is_native_shell || g.is_harmony) return 0
  return Number(window.__safeAreaTop) || 0
}
