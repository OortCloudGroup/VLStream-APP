/*
 * Copyright 奥尔特云（深圳）智慧科技有限公司. All rights reserved.
 *
 * Shell status bar color manager.
 *
 * The native shells keep the web content below the system status bar
 * (non-immersive window), so the status bar background must follow the color
 * of the H5 area right under it. This module tracks two layers:
 *   - base: the routed page style, reset by router.afterEach on every
 *     navigation
 *   - overlays: styles of fullscreen covers mounted on top of a route
 *     (NavHeaderBanner detail pages, the login panel), pushed on mount and
 *     popped on unmount
 * Because base and overlays are tracked separately, the order in which a page
 * component and the router hook run does not matter; the visible style is
 * always the topmost overlay, falling back to the base.
 *
 * Every operation is a no-op outside a native shell that provides the
 * NativeBridge.setStatusBar plugin method.
 */
type StatusBarStyle = {
  color: string
  contentColor: string
}

let base: StatusBarStyle | null = null
const overlays: StatusBarStyle[] = []

/**
 * Whether the page runs inside a native Capacitor shell.
 * Legacy shells expose Capacitor.isNative; the standard Capacitor runtime
 * (e.g. the HarmonyOS native-bridge.js) only exposes isNativePlatform().
 */
function isNativeRuntime(): boolean {
  const cap = window.Capacitor
  if (!cap) return false
  if (cap.isNative === true) return true
  return typeof cap.isNativePlatform === 'function' && cap.isNativePlatform() === true
}

function apply(): void {
  if (!isNativeRuntime()) return
  const cap = window.Capacitor
  const bridge = cap && cap.Plugins ? cap.Plugins.NativeBridge : null
  if (!bridge || typeof bridge.setStatusBar !== 'function') return
  const top: StatusBarStyle | null = overlays.length > 0
    ? overlays[overlays.length - 1]
    : base
  if (!top) return
  bridge.setStatusBar({ color: top.color, contentColor: top.contentColor }).catch(() => {})
}

/** Reset the base style of the routed page; called by router.afterEach. */
export function setRootStatusBar(color: string, contentColor: string): void {
  base = { color, contentColor }
  apply()
}

/** Push the style of a fullscreen cover mounted above the routed page. */
export function pushStatusBar(color: string, contentColor: string): void {
  overlays.push({ color, contentColor })
  apply()
}

/** Pop the topmost fullscreen cover style, falling back to the base. */
export function popStatusBar(): void {
  overlays.pop()
  apply()
}

/**
 * Toggle immersive fullscreen on the native shell: while an element (e.g. a
 * fullscreen video) is displayed the system status bar / navigation bar are
 * hidden so the video fills the whole screen; on exit they are restored.
 */
export function setImmersive(enabled: boolean): void {
  if (!isNativeRuntime()) return
  const cap = window.Capacitor
  const bridge = cap && cap.Plugins ? cap.Plugins.NativeBridge : null
  if (!bridge || typeof bridge.setImmersiveMode !== 'function') return
  bridge.setImmersiveMode({ enabled }).catch(() => {})
}

/** Sync immersive mode with the document fullscreen state and re-assert bar colors on exit. */
function handleFullscreenChange(): void {
  const doc = document as Document & { webkitFullscreenElement?: Element | null }
  const active = !!(document.fullscreenElement || doc.webkitFullscreenElement)
  setImmersive(active)
  if (!active) apply()
}

// Track document fullscreen enter/exit globally so every fullscreen video
// (grid fullscreen, single cell fullscreen) becomes immersive on the shell.
if (typeof document !== 'undefined') {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
}
