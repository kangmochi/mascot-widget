globalThis.document = {
  createElement: () => ({ textContent: '', remove() {} }),
  head: { append() {} }
}
globalThis.setInterval = () => 0
globalThis.clearInterval = () => {}
import plugin from './plugin.copy.mjs'
import { __setBundle } from '@hermes/plugin-sdk'

const registrations = []
const settings = []
const disposed = []
const store = new Map()
const ctx = {
  register: r => registrations.push(r),
  registerSettingsPage: p => settings.push(p),
  storage: { get: (k, d) => (store.has(k) ? store.get(k) : d), set: (k, v) => store.set(k, v), remove: k => store.delete(k) },
  i18n: { register: b => { __setBundle(b.en) } },
  os: { writeClipboard: async () => true },
  onDispose: f => disposed.push(f),
  pet: { visible: false, say: () => () => {} }
}

plugin.register(ctx)
console.log('id:', plugin.id, '| name:', plugin.name)
console.log('registrations:', registrations.map(r => `${r.id}@${r.area}`).join(', '))
console.log('settings pages:', settings.map(s => s.title + ' [' + (s.children||[]).map(c=>c.title).join('/') + ']').join('; '))
// Render every registered component and every settings page.
function flat(node, out = []) {
  if (node == null || node === false) return out
  if (Array.isArray(node)) { node.forEach(n => flat(n, out)); return out }
  if (typeof node !== 'object') { out.push(String(node)); return out }
  if (typeof node.type === 'function') {
    if (node.type.prototype && typeof node.type.prototype.render === 'function') {
      const inst = new node.type(node.props || {})
      inst.props = node.props || {}
      inst.state = inst.state || {}
      flat(inst.render(), out)
    } else {
      flat(node.type(node.props || {}), out)
    }
    return out
  }
  if (node.props) {
    const rest = Object.entries(node.props).filter(([k]) => k !== 'children')
    for (const [k, v] of rest) if (typeof v === 'string' && v.length < 80) out.push(`${k}=${v}`)
    if (node.props.children !== undefined) flat(node.props.children, out)
  }
  return out
}
for (const r of registrations) {
  if (typeof r.render !== 'function') continue
  try {
    const tree = r.render()
    const text = flat(tree).join(' | ')
    console.log(`render ${r.id} ->`, text.slice(0, 400))
  } catch (e) { console.log(`render ${r.id} FAILED:`, e.message) }
}
for (const page of settings) {
  for (const part of [page, ...(page.children || [])]) {
    try { const tree = part.render(); console.log(`settings ${part.title} ->`, flat(tree).join(' | ').slice(0, 220)) }
    catch (e) { console.log(`settings ${part.title} FAILED:`, e.message) }
  }
}
console.log('style injected:', typeof document !== 'undefined' ? 'yes' : 'no-document')

// Empty-state pass: no session, no usage.
const { host } = await import('@hermes/plugin-sdk')
host.state.focusedUsage.set(null)
host.state.focusedStoredSessionId.set(undefined)
host.state.busy.set(false)
host.state.awaitingResponse.set(true)
try {
  const paneText = flat(registrations.find(r => r.id === 'pane').render()).join(' | ')
  console.log('empty pane ->', paneText.slice(0, 220))
} catch (e) { console.log('empty pane FAILED:', e.message) }
