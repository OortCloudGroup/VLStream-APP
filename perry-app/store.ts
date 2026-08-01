/*
 * 存储适配层：用 node:fs 文件持久化，对齐 vue3-h5-ts 的 utils/cache.ts。
 * Perry 的 keychain/preferences 在 Windows 是 stub，故改用文件。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

interface PersistState {
  token: string
  tenantId: string
}

const DATA_DIR = join(process.cwd(), 'perry-app-data')
const STATE_FILE = join(DATA_DIR, 'state.json')

function readAll(): PersistState {
  try {
    if (!existsSync(STATE_FILE)) return { token: '', tenantId: '' }
    const raw = readFileSync(STATE_FILE, 'utf8')
    const obj = JSON.parse(raw)
    return { token: String(obj.token || ''), tenantId: String(obj.tenantId || '') }
  } catch {
    return { token: '', tenantId: '' }
  }
}

function writeAll(state: PersistState): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(STATE_FILE, JSON.stringify(state), 'utf8')
}

/** 读取 token（对齐 cache.ts getToken） */
export function getToken(): string {
  return readAll().token
}

/** 写入 token（对齐 cache.ts setToken） */
export function setToken(token: string): void {
  const all = readAll()
  all.token = token
  writeAll(all)
}

/** 清除 token（对齐 cache.ts removeToken，保留 tenantId） */
export function removeToken(): void {
  writeAll({ token: '', tenantId: readAll().tenantId })
}

export function getTenantId(): string {
  return readAll().tenantId
}

export function setTenantId(tenantId: string): void {
  const all = readAll()
  all.tenantId = tenantId
  writeAll(all)
}
