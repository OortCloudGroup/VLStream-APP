/*
* @Created by: Qoder
* @Date: 2026-10-28
* @Copyright aPaaS-front-team. All rights reserved.
*/

// 算法仓库封面兜底：后端 imageUrl 普遍为空，管理端用一组渐变色卡代替，
// 这里按算法 id + 仓库 id 取同一个色卡，保证同一条算法每次渲染颜色稳定。
const COVER_COLORS = [
  ['#2f69f8', '#6fa6ff'],
  ['#7a5cf0', '#b39bff'],
  ['#00a6a6', '#5cd6c0'],
  ['#ef6c3b', '#ffb27a'],
  ['#d9447a', '#ff86ad'],
  ['#3a8f5f', '#7fd6a2'],
  ['#4b5bd6', '#8f9cff']
]

const toSeed = (value: any) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  const tail = digits.slice(-6)
  return tail ? Number(tail) : 0
}

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

export function algorithmCoverFallback(id: any, repositoryId: any, name = '') {
  const index = (toSeed(id) + toSeed(repositoryId)) % COVER_COLORS.length
  const [from, to] = COVER_COLORS[index]
  const label = escapeXml(String(name).slice(0, 8))
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="200" viewBox="0 0 360 200">' +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>` +
    '<rect width="360" height="200" fill="url(#g)"/>' +
    '<circle cx="300" cy="40" r="90" fill="rgba(255,255,255,0.12)"/>' +
    '<circle cx="46" cy="184" r="72" fill="rgba(255,255,255,0.10)"/>' +
    `<text x="24" y="120" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="26" font-weight="600" fill="#ffffff">${label}</text>` +
    '</svg>'
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
