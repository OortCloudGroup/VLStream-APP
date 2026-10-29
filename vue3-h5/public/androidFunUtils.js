/**
 * VLStreamCloud H5 ↔ Android 原生壳 桥接层（Capacitor 版）
 *
 * 对外接口与旧版（AgentWeb / cordova.exec）完全一致，业务代码无需改动：
 *   window.androidFunUtils.{getGateway, getToken, getAppInfo, tokenOverdue, appExit, takePhoto}
 *   window.FileTransfer / window.FileUploadOptions  （上传 polyfill，保留不变）
 *
 * 实现切换：
 *   - 原生壳（Capacitor，window.Capacitor.isNative === true）：
 *       拍照/相册 → @capacitor/camera
 *       退出 App  → @capacitor/app
 *       网关/appInfo/tokenOverdue → 自研 NativeBridge plugin（见 Android 端 NativeBridgePlugin）
 *       getGateway/getAppInfo 走「原生启动期注入的同步静态变量」window.__VL_STATIC__，
 *       以保持对 H5 的同步调用语义（App.vue 不改）。
 *   - 浏览器/PC 调试（window.Capacitor 不存在或非原生）：
 *       走原逻辑，行为与迁移前一致。
 */
;(function (root) {
  // —— 运行环境检测 ——
  const cap = function () {
    return (typeof root !== 'undefined') && root.Capacitor && root.Capacitor.isNative ? root.Capacitor : null
  }
  const isNative = function () {
    return !!cap()
  }

  // 回调表 / 文件 base64 映射（FileTransfer polyfill 用）
  const fileDataMap = {}

  function ensureGlobal() {
    root.global = root.global || {}
    return root.global
  }

  // —— 启动期注入的同步静态变量（由原生 NativeBridgePlugin 在页面加载前 evaluateJavascript 注入）——
  // 形如：window.__VL_STATIC__ = { gateway: 'http://1.2.3.4:8080', appInfo: {...} }
  function staticData() {
    return (typeof root !== 'undefined') && root.__VL_STATIC__ ? root.__VL_STATIC__ : null
  }

  // —— 自研业务 plugin（懒取，原生壳里 Capacitor 自动注册）——
  function nativeBridge() {
    const c = cap()
    return c && c.Plugins ? c.Plugins.NativeBridge : null
  }

  function toPromise(fn, fallback) {
    try {
      const r = typeof fn === 'function' ? fn() : fn
      return (r && typeof r.then === 'function') ? r : Promise.resolve(r)
    } catch (e) {
      return typeof fallback === 'function' ? Promise.resolve(fallback()) : Promise.reject(e)
    }
  }

  const androidFunUtils = {
    /**
     * 取后端网关地址（同步）。
     * 原生壳：读原生注入的 window.__VL_STATIC__.gateway。
     * 浏览器：返回空串（走 App.vue 里 location.origin 兜底）。
     * @returns {string}
     */
    getGateway: function () {
      const s = staticData()
      if (s && s.gateway) return s.gateway
      return ''
    },

    /**
     * 取 token（新壳不再由原生管理；返回 sessionStorage 里的值，兼容旧调用）。
     * @returns {Promise<string>}
     */
    getToken: function () {
      try {
        const t = sessionStorage.getItem('token') || ''
        return Promise.resolve(t)
      } catch (e) {
        return Promise.resolve('')
      }
    },

    /**
     * 取应用信息（包名/版本/图标等），返回 JSON 字符串（调用方会 JSON.parse）。
     * @returns {Promise<string>}
     */
    getAppInfo: function () {
      // 优先用原生注入的静态 appInfo（启动期已知，免一次 IPC）
      const s = staticData()
      if (s && s.appInfo) return Promise.resolve(JSON.stringify(s.appInfo))
      // 兜底：自研 plugin
      const nb = nativeBridge()
      if (nb && typeof nb.getAppInfo === 'function') {
        return toPromise(function () { return nb.getAppInfo() })
          .then(function (res) {
            if (res && typeof res === 'object') return JSON.stringify(res)
            return JSON.stringify(defaultAppInfo())
          }, function () { return JSON.stringify(defaultAppInfo()) })
      }
      return Promise.resolve(JSON.stringify(defaultAppInfo()))
    },

    /**
     * token 失效：通知原生清会话并重载。
     * @returns {Promise<void>}
     */
    tokenOverdue: function () {
      const nb = nativeBridge()
      if (nb && typeof nb.tokenOverdue === 'function') {
        return toPromise(function () { return nb.tokenOverdue() }).then(function () { return true }, function () { return true })
      }
      return Promise.resolve(true)
    },

    /**
     * 退出 App。
     * @returns {Promise<void>}
     */
    appExit: function () {
      const c = cap()
      const app = c && c.Plugins ? c.Plugins.App : null
      if (app && typeof app.exitApp === 'function') {
        return toPromise(function () { return app.exitApp() }).then(function () { return true }, function () { return true })
      }
      return Promise.resolve(true)
    },

    /**
     * 拍照 / 相册多选。
     * @param {object} params 见 oort_uploader.vue:133（mQuality/srcType/mediaType/targetWidth/selectNumLimit 等）
     * @returns {Promise<string>} JSON 数组字符串：[{ filePath, base64?, size? }]
     *
     * 映射（@capacitor/camera）：
     *   srcType 1=拍照 Camera.getPhoto(source=CAMERA)
     *   srcType 0/2=相册：selectNumLimit>1 → Camera.pickImages(limit)；否则 Camera.getPhoto(source=PHOTOS)
     *   mediaType 仅处理图片类（0 图片 / 2 图片视频 中的图片部分）；视频/音频/附件首期降级 reject。
     */
    takePhoto: function (params) {
      params = params || {}
      const c = cap()
      const Camera = c && c.Plugins ? c.Plugins.Camera : null
      if (!Camera) {
        return Promise.reject(new Error('camera plugin not available'))
      }

      const quality = clamp(parseInt(params.mQuality, 10) || 50, 1, 100)
      const srcType = (params.srcType === undefined) ? 1 : params.srcType
      const mediaType = (params.mediaType === undefined) ? 0 : params.mediaType
      const limit = Math.max(1, parseInt(params.selectNumLimit, 10) || 1)
      const tw = parseInt(params.targetWidth, 10) || 0
      const th = parseInt(params.targetHeight, 10) || 0

      // 首期仅支持图片；视频/音频/附件降级
      if (mediaType === 1 || mediaType === 3) {
        return Promise.reject(new Error('video/audio capture not supported in this build'))
      }

      function itemFromPhoto(p) {
        // p: { base64String, format, webPath, path }
        const fmt = (p && p.format) || 'jpeg'
        const mime = fmt === 'png' ? 'image/png' : 'image/jpeg'
        const b64 = p && p.base64String ? ('data:' + mime + ';base64,' + p.base64String) : ''
        const filePath = (p && (p.webPath || p.path)) || ''
        const size = b64 ? Math.floor((b64.split(',')[1] || '').length * 0.75) : 0
        const item = { filePath: filePath, size: size }
        if (b64) item.base64 = b64
        return item
      }

      function registerItems(items) {
        items.forEach(function (it) {
          if (it && it.filePath && it.base64) fileDataMap[it.filePath] = it.base64
        })
        return JSON.stringify(items)
      }

      if (srcType === 1) {
        // 拍照
        return toPromise(function () {
          return Camera.getPhoto({
            quality: quality,
            allowEditing: !!params.allowEdit,
            resultType: 'Base64', // 同时拿 base64，供 FileTransfer 还原成 Blob
            source: 'CAMERA',
            width: tw || undefined,
            height: th || undefined,
            correctOrientation: params.correctOrientation !== false,
            saveToGallery: !!params.saveToPhotoAlbum
          })
        }).then(function (photo) {
          return registerItems([itemFromPhoto(photo)])
        }, function (err) {
          return Promise.reject(err)
        })
      }

      // 相册（srcType 0/2）
      if (limit > 1 && typeof Camera.pickImages === 'function') {
        return toPromise(function () {
          return Camera.pickImages({
            quality: quality,
            limit: limit,
            width: tw || undefined,
            height: th || undefined
          })
        }).then(function (res) {
          const photos = (res && res.photos) || []
          return registerItems(photos.map(itemFromPhoto))
        }, function (err) {
          return Promise.reject(err)
        })
      }
      return toPromise(function () {
        return Camera.getPhoto({
          quality: quality,
          allowEditing: !!params.allowEdit,
          resultType: 'Base64',
          source: 'PHOTOS',
          width: tw || undefined,
          height: th || undefined,
          correctOrientation: params.correctOrientation !== false
        })
      }).then(function (photo) {
        return registerItems([itemFromPhoto(photo)])
      }, function (err) {
        return Promise.reject(err)
      })
    }
  }

  function defaultAppInfo() {
    return {
      apppackage: 'com.oort.vlstream',
      app_id: '747aa0fa18d047c8b526e242142e0a6c',
      app_secret: '3a97f4f65b204a3a96071746fa42936a',
      applabel: 'VLStreamCloud',
      version: '1.0.0'
    }
  }

  function clamp(v, lo, hi) {
    if (v < lo) return lo
    if (v > hi) return hi
    return v
  }

  /**
   * cordova FileTransfer polyfill（与旧版一致，保留不变）。
   * 背景：oort_uploader.vue / oort_fileUpload.vue 用 new window.FileTransfer() + ft.upload(...) 上传本地 uri。
   * 这里改用 XHR + FormData：
   *   - 图片：从 takePhoto 记录的 base64 还原成 Blob
   *   - 其他文件：file:// 或 capacitor 的 webPath（https://localhost/_capacitor_file_...）在 WebView 同源可 fetch
   */
  function dataURLtoBlob(dataURL) {
    try {
      const arr = dataURL.split(',')
      const mime = (arr[0].match(/:(.*?);/) || [])[1] || 'image/jpeg'
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8 = new Uint8Array(n)
      while (n--) { u8[n] = bstr.charCodeAt(n) }
      return new Blob([u8], { type: mime })
    } catch (e) {
      return null
    }
  }

  function guessFileName(filePath, blob) {
    const name = (filePath || '').split('/').pop() || ('file_' + Date.now())
    if (name.indexOf('.') > -1) return decodeURIComponent(name)
    const ext = (blob && blob.type && blob.type.split('/')[1]) || 'bin'
    return name + '.' + ext
  }

  function FileUploadOptions() {
    this.fileKey = 'file'
    this.fileName = ''
    this.mimeType = null
    this.params = null
    this.headers = null
    this.chunkedMode = true
  }

  function FileTransferError(code) {
    this.code = code
    this.source = ''
    this.target = ''
    this.http_status = 0
    this.body = ''
  }

  function FileTransfer() {}

  FileTransfer.prototype.upload = function (filePath, serverUrl, winCb, failCb, options, trustAllHosts) {
    options = options || {}
    const fileKey = options.fileKey || 'file'
    const headers = options.headers || {}
    const params = options.params || {}
    const fileName = options.fileName || guessFileName(filePath)

    const doUpload = function (blob) {
      if (!blob) {
        failCb && failCb(new FileTransferError(5))
        return
      }
      const fd = new FormData()
      fd.append(fileKey, blob, decodeURIComponent(fileName))
      Object.keys(params).forEach(function (k) { fd.append(k, params[k]) })

      const xhr = new XMLHttpRequest()
      xhr.open('POST', serverUrl, true)
      Object.keys(headers).forEach(function (k) {
        try { xhr.setRequestHeader(k, headers[k]) } catch (e) {}
      })
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return
        if (xhr.status >= 200 && xhr.status < 300) {
          winCb && winCb({ response: xhr.response, responseCode: xhr.status, bytesSent: 0 })
        } else {
          const e = new FileTransferError(3)
          e.http_status = xhr.status
          e.body = xhr.responseText
          failCb && failCb(e)
        }
      }
      try {
        xhr.send(fd)
      } catch (e) {
        failCb && failCb(new FileTransferError(3))
      }
    }

    // 优先用 takePhoto 记录的 base64（图片）
    if (fileDataMap[filePath]) {
      doUpload(dataURLtoBlob(fileDataMap[filePath]))
      return
    }
    // 兜底：fetch（capacitor webPath / 同源 file 均可读，跨域外部路径会失败）
    fetch(filePath)
      .then(function (r) { return r.blob() })
      .then(doUpload)
      .catch(function () {
        failCb && failCb(new FileTransferError(1))
      })
  }

  // —— 暴露到全局 ——
  root.FileTransfer = FileTransfer
  root.FileUploadOptions = FileUploadOptions

  // 原生壳兜底：标记运行环境（与原生 NativeBridgePlugin 的注入互为补充，二者保持一致）
  const g = ensureGlobal()
  if (isNative()) {
    g.is_native_shell = true
    g.is_cordova = false
    g.is_phone = true
    g.is_harmony = false
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = androidFunUtils
  }
  root.androidFunUtils = androidFunUtils
})(typeof window !== 'undefined' ? window : this)
