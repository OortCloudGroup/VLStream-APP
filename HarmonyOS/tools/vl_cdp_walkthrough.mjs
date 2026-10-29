// CDP-driven UI walkthrough for VLStream H5 (device webview via hdc fport :9222)
//
// Prerequisites ( HarmonyOS real device, webview debug enabled ):
//   1. hdc -t <serial> fport rm tcp:9222                       ( clear stale rule )
//   2. hdc -t <serial> fport tcp:9222 localabstract:webview_devtools_remote_<pid>
//   3. export VL_WALK_USER / VL_WALK_PWD before using the `login` command
//      ( credentials are never hard-coded here )
//
// Usage: node vl_cdp_walkthrough.mjs <login|workbench|clickdev|clickfirst|toast|dump|eval> [jsExpr]
const CDP = 'http://127.0.0.1:9222/json'
const sleep = ms => new Promise(r => setTimeout(r, ms))

const WALK_USER = process.env.VL_WALK_USER || ''
const WALK_PWD = process.env.VL_WALK_PWD || ''

const targets = await (await fetch(CDP)).json()
const page = targets.find(t => t.type === 'page')
if (!page) { console.error('NO_PAGE_TARGET'); process.exit(1) }

const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })

let seq = 0
const pending = new Map()
ws.onmessage = ev => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) }
}

function evalJs(expression, awaitPromise = false) {
  return new Promise(resolve => {
    const id = ++seq
    pending.set(id, resolve)
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true, awaitPromise } }))
  })
}

const results = []
function check(name, cond, detail = '') {
  results.push({ name, pass: !!cond, detail })
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  | ' + String(detail).replace(/\n/g, ' ') : ''}`)
}

const cmd = process.argv[2] || 'workbench'

if (cmd === 'workbench') {
  const body = (await evalJs('document.body.innerText')).result.result.value
  console.log('HASH=' + (await evalJs('location.hash')).result.result.value)
  console.log('--- BODY TEXT ---')
  console.log(body)
  console.log('--- ASSERTIONS ---')
  check('greeting-en-order', /Good (morning|afternoon|evening), admin!/.test(body), (body.match(/Good \w+, admin!/) || ['(none)'])[0])
  check('date-en-format', /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}, 2026/.test(body), (body.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}, 2026/) || ['(none)'])[0])
  check('weekday-en', /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/.test(body), (body.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/) || ['(none)'])[0])
  check('quick-access', body.includes('Quick Access'))
  check('popular-devices', body.includes('Popular Devices'))
  check('nav-workbench', body.includes('Workbench'))
  check('nav-video', body.includes('Video'))
  check('nav-event', body.includes('Event'))
  check('nav-mine', body.includes('Mine'))
} else if (cmd === 'login') {
  if (!WALK_USER || !WALK_PWD) {
    console.error('MISSING_CREDENTIALS: set VL_WALK_USER and VL_WALK_PWD env vars')
    process.exit(1)
  }
  const r = await evalJs(`(function(){
    const inputs = [...document.querySelectorAll('input')]
    const setVal = (el, v) => {
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set
      setter.call(el, v)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    const account = inputs.find(i => /username|account|用户名/i.test(i.placeholder || ''))
    const pwd = inputs.find(i => i.type === 'password')
    if (!account || !pwd) return 'NO_INPUTS: ' + inputs.map(i => i.placeholder + ':' + i.type).join(', ')
    setVal(account, ${JSON.stringify(WALK_USER)})
    setVal(pwd, ${JSON.stringify(WALK_PWD)})
    return 'FILLED ' + account.placeholder + ' / ' + pwd.placeholder
  })()`)
  console.log(r.result.result.value)
  const c = await evalJs(`(function(){
    const btn = [...document.querySelectorAll('.van-button, button')].find(el => /^Log In$/.test((el.innerText || '').trim()))
    if (!btn) return 'NO_LOGIN_BUTTON: ' + [...document.querySelectorAll('.van-button, button')].map(b => b.innerText).join('|')
    btn.click()
    return 'CLICKED'
  })()`)
  console.log(c.result.result.value)
  await sleep(6000)
  console.log('HASH=' + (await evalJs('location.hash')).result.result.value)
  console.log('--- BODY TEXT ---')
  console.log((await evalJs('document.body.innerText')).result.result.value)
} else if (cmd === 'clickdev') {
  // Click the first device card under Popular Devices, then report state
  const r = await evalJs(`(function(){
    const btn = document.querySelector('.devices-list .device-item .play-btn')
    if (btn) { btn.click(); return 'CLICKED_PLAY' }
    return 'NO_PLAY_BTN'
  })()`)
  console.log(r.result.result.value)
  await sleep(5000)
  const state = await evalJs(`(function(){
    const toast = document.querySelector('.van-toast')
    const overlay = document.querySelector('.van-overlay')
    return JSON.stringify({
      hash: location.hash,
      toastText: toast ? toast.innerText : '',
      overlay: !!overlay,
      overlayStyle: overlay ? overlay.getAttribute('style') : ''
    })
  })()`)
  console.log('STATE=' + state.result.result.value)
  console.log('--- BODY TEXT ---')
  console.log((await evalJs('document.body.innerText')).result.result.value)
} else if (cmd === 'toast') {
  const state = await evalJs(`(function(){
    const toast = document.querySelector('.van-toast')
    const overlay = document.querySelector('.van-overlay')
    return JSON.stringify({
      hash: location.hash,
      toastText: toast ? toast.innerText : '',
      overlayVisible: !!overlay
    })
  })()`)
  console.log('STATE=' + state.result.result.value)
} else if (cmd === 'clickfirst') {
  const r = await evalJs(`(function(){
    const idEl = [...document.querySelectorAll('*')].find(el => el.children.length === 0 && (el.innerText || '').trim() === 'AETY-00-X6UN-XCWB-00000004')
    if (!idEl) return 'NO_TARGET'
    let card = idEl
    for (let i = 0; i < 8 && card.parentElement; i++) {
      card = card.parentElement
      if (/card|item|cell|list-row/.test(card.className || '')) break
    }
    card.click()
    return 'CLICKED:' + card.className
  })()`)
  console.log(r.result.result.value)
  await sleep(6000)
  const state = await evalJs(`(function(){
    const toast = document.querySelector('.van-toast')
    const overlay = document.querySelector('.van-overlay')
    return JSON.stringify({
      hash: location.hash,
      toastText: toast ? toast.innerText : '',
      toastVisible: toast ? getComputedStyle(toast).display !== 'none' : false,
      overlayBlocking: overlay ? getComputedStyle(overlay).display !== 'none' : false
    })
  })()`)
  console.log('STATE=' + state.result.result.value)
  console.log('--- BODY TEXT (first 60 lines) ---')
  const body = (await evalJs('document.body.innerText')).result.result.value
  console.log(body.split('\n').slice(0, 60).join('\n'))
} else if (cmd === 'dump') {
  const body = (await evalJs('document.body.innerText')).result.result.value
  console.log('HASH=' + (await evalJs('location.hash')).result.result.value)
  console.log('--- BODY TEXT ---')
  console.log(body)
} else if (cmd === 'eval') {
  const r = await evalJs(process.argv[3])
  console.log(JSON.stringify(r.result, null, 2))
}

ws.close()
const failed = results.filter(r => !r.pass).length
console.log(`\nSUMMARY: ${results.length - failed}/${results.length} passed`)
process.exit(failed ? 2 : 0)
