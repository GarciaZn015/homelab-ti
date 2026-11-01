// Carrega trechos do index.html (e do backup original) em um contexto isolado do Node, sem navegador.
// Nada aqui toca no save real: cada contexto recebe um localStorage falso em memória.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '..');
export const ORIGINAL = path.join(ROOT, '_backup_original_2026-10-31', 'index.html');

export function fakeStorage({ quota = Infinity, failSet = false } = {}) {
  const m = new Map();
  const used = () => [...m.entries()].reduce((n, [k, v]) => n + k.length + v.length, 0);
  return {
    _m: m,
    get length() { return m.size; },
    key(i) { return [...m.keys()][i] ?? null; },
    getItem(k) { return m.has(k) ? m.get(k) : null; },
    setItem(k, v) {
      v = String(v);
      if (failSet) { const e = new Error('blocked'); e.name = 'SecurityError'; throw e; }
      const before = m.has(k) ? k.length + m.get(k).length : 0;
      if (used() - before + k.length + v.length > quota) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; }
      m.set(k, v);
    },
    removeItem(k) { m.delete(k); },
    clear() { m.clear(); },
  };
}

function section(src, a, b) {
  const i = src.indexOf(a), j = src.indexOf(b, i + 1);
  if (i < 0 || j < 0) throw new Error(`trecho não encontrado: ${a} … ${b}`);
  return src.slice(i, j);
}
function script(file) {
  const s = fs.readFileSync(file, 'utf8');
  return s.slice(s.indexOf('<script>') + 8, s.lastIndexOf('</script>'));
}

// Núcleo atual: dados + estado + salvamento (@core) + fórmulas e utilitários.
export function loadCore(storage = fakeStorage()) {
  const js = script(path.join(ROOT, 'index.html'));
  const core = section(js, '/* @core-begin', '/* @core-end */');
  const utils = section(js, '/* =========================================================\n   UTILITÁRIOS', '/* =========================================================\n   ÁUDIO');
  const ctx = vm.createContext({ console, TextEncoder, TextDecoder, btoa, atob, localStorage: storage });
  vm.runInContext(core + '\n' + utils + `
    var S = defaults();
    var combo = { n: 0, t: 9 };
    function setS(x) { S = x; }
    globalThis.__api = { defaults, merge, migrate, fromRaw, fromRawChecked, sanitizeItem, validateState, encodeSave, decodeSave, peekSave,
      writeSave, writeSafety, readSafety, chooseLoad, offlineSeconds, exportCodeOf, importCodeChecked, saveSummary, addCapped, hash,
      Store, Session, setS, getS: () => S, hpFor, goldFor, tapDmg, dps, heroCost, allyCost, costN, maxN, essGain, goldPerSec, fmt, itemMain,
      consts: { SAVE_KEY, BACKUP_KEY, SNAP_KEY, SAFETY_KEY, CORRUPT_KEY, SNAP_COUNT, VERSION, MAX_NUM, INV_MAX, OFFLINE_CAP, PITY, MAX_CODE_CHARS } };
  `, ctx, { filename: 'index.html#core' });
  const api = ctx.__api;
  api.Store.init(storage);
  return api;
}

// Código ORIGINAL (cópia em _backup_original_2026-10-31): gera saves e códigos exatamente como a versão publicada fazia.
export function loadOriginal() {
  const js = script(ORIGINAL);
  const part = section(js, 'const SAVE_KEY', 'function storeGet');
  const ctx = vm.createContext({ btoa, atob });
  vm.runInContext(part + `
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    function itemName(it) { return SLOT_DEF[it.slot].models[it.model] + ' ' + ITEM_SUFFIX[it.rar]; }
    function parseSave(text) {
      if (!text) return null;
      try { const w = JSON.parse(text); if (!w || typeof w.data !== 'string') return null; if (w.h && w.h !== hash(w.data)) return null; return fromRaw(JSON.parse(w.data)); } catch (e) { return null; }
    }
    function serializeOf(S) { const data = JSON.stringify(S); return JSON.stringify({ h: hash(data), data }); }
    function exportCodeOf(S) { const json = JSON.stringify(S); return 'LR1.' + btoa(unescape(encodeURIComponent(json))) + '.' + hash(json); }
    function importCode(code) {
      code = (code || '').trim(); const m = /^LR1\\.([A-Za-z0-9+/=]+)\\.([a-z0-9]+)$/.exec(code); if (!m) return null;
      try { const json = decodeURIComponent(escape(atob(m[1]))); if (hash(json) !== m[2]) return null; return fromRaw(JSON.parse(json)); } catch (e) { return null; }
    }
    globalThis.__old = { defaults, fromRaw, parseSave, serializeOf, exportCodeOf, importCode, VERSION, hash };
  `, ctx, { filename: 'original#core' });
  return ctx.__old;
}

// Um jogador "de verdade" da versão 4: progresso, itens, conquistas, missões, configurações.
export function representativeV4(old) {
  const S = old.defaults();
  Object.assign(S, {
    gold: 123456789.25, stage: 57, wave: 4, maxStage: 88, runMaxStage: 57, bossFailed: true, farmKills: 3, hero: 312,
    ess: 14, essTotal: 61, prestiges: 3, ancientBest: 80, frags: 431, pity: 17, nextItemId: 120, mana: 64.5, clock: 98765.4,
    created: 1760000000000, lastSave: 1761900000000,
  });
  S.allies = S.allies.map((_, i) => (i < 9 ? 200 - i * 20 : 0));
  S.allyForms[0] = { sp: 4, hue: 211 };
  S.skills = [{ lvl: 5, until: 0, cd: 98000 }, { lvl: 3, until: 0, cd: 0 }, { lvl: 2, until: 0, cd: 0 }, { lvl: 0, until: 0, cd: 0 }];
  S.arts = { elmo: 6, bolsa: 4, olho: 3, calice: 2 };
  S.ach = { taps: 3, kills: 2, stage: 2 };
  S.daily = { last: '2026-10-30', streak: 5 };
  S.quests = { day: '2026-10-30', bonus: false, q0: { type: 'taps', goal: 600, prog: 410, done: false }, q1: { type: 'kills', goal: 60, prog: 60, done: true }, q2: { type: 'wisps', goal: 2, prog: 0, done: false } };
  Object.assign(S.stats, { taps: 45210, crits: 1530, kills: 9876, bosses: 412, chests: 31, gold: 9.9e12, skills: 288, maxTap: 4.2e9, maxCombo: 133, wisps: 77, active: 36000, open: 52000, offline: 99000, rerolls: 2, quests: 40, items: 103, legend: 4 });
  Object.assign(S.settings, { volume: 0.35, music: false, notation: 'sci', autosave: 30, autoBoss: false, autoSalvage: 2, panelCollapsed: true, buyQty: 'max' });
  const item = (id, slot, rar, lvl, up, model, sec) => ({ id, slot, rar, lvl, up, model, hue: (id * 37) % 360, ex: id % 5 === 0, sec, name: '' });
  S.equip = {
    sword: item(101, 'sword', 4, 60, 7, 3, { type: 'critD', val: 100 }),
    hat: item(102, 'hat', 3, 55, 2, 1, { type: 'mana', val: 0.3 }),
    armor: item(103, 'armor', 2, 50, 0, 2, { type: 'gold', val: 30 }),
    ring: null,
  };
  S.inv = [item(110, 'ring', 1, 40, 0, 0, null), item(111, 'sword', 0, 33, 1, 4, null), item(115, 'armor', 5, 70, 0, 1, { type: 'boss', val: 5 })];
  const named = old.fromRaw(JSON.parse(JSON.stringify(S)));      // nomes como o jogo original os gera
  for (const k of ['sword', 'hat', 'armor']) S.equip[k].name = named.equip[k].name;
  S.inv.forEach((it, i) => { it.name = named.inv[i].name; });
  return S;
}
