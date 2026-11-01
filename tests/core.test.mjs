// Testes do núcleo de salvamento, migração, importação e economia.  Rodar:  node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCore, loadOriginal, representativeV4, fakeStorage } from './harness.mjs';

const plain = x => JSON.parse(JSON.stringify(x));          // objetos de outro contexto do vm → objetos comuns
const old = loadOriginal();

function newGame(storage) {                                  // simula abrir uma aba: novo id de aba, revisão do que carregou
  const api = loadCore(storage);
  const L = api.chooseLoad();
  if (L.kind === 'ok' || L.kind === 'backup') { api.setS(L.res.state); api.Session.knownRev = L.res.meta.rev || 0; }
  return { api, L };
}

test('1. jogador novo: armazenamento vazio vira novo jogo, sem herdar nada', () => {
  const st = fakeStorage();
  const { L, api } = newGame(st);
  assert.equal(L.kind, 'fresh');
  const r = api.writeSave(api.defaults());
  assert.equal(r.ok, true);
  const back = api.decodeSave(st.getItem(api.consts.SAVE_KEY));
  assert.equal(back.ok, true);
  assert.equal(back.state.stage, 1);
  assert.equal(back.state.gold, 0);
});

test('2/3. save real da versão 4 (gerado pelo código original) carrega e migra sem alterar valores', () => {
  const raw4 = representativeV4(old), v4 = plain(raw4);
  const st = fakeStorage();
  st.setItem('laminaRunica.save.v1', old.serializeOf(raw4));
  const { L } = newGame(st);
  assert.equal(L.kind, 'ok');
  const s = plain(L.res.state);
  assert.deepEqual(plain(L.res.fixes), [], 'save legítimo não pode sofrer correções');
  assert.equal(s.v, 5);
  for (const k of ['gold', 'stage', 'wave', 'maxStage', 'runMaxStage', 'bossFailed', 'farmKills', 'hero', 'ess', 'essTotal', 'prestiges', 'ancientBest', 'frags', 'pity', 'mana', 'clock', 'created', 'lastSave'])
    assert.deepEqual(s[k], v4[k], k);
  assert.deepEqual(s.allies, v4.allies);
  assert.deepEqual(s.allyForms, plain(v4.allyForms));
  assert.deepEqual(s.skills, v4.skills);
  assert.deepEqual(s.arts, v4.arts);
  assert.deepEqual(s.ach, v4.ach);
  assert.deepEqual(s.daily, v4.daily);
  assert.deepEqual(s.quests, v4.quests);
  assert.deepEqual(s.stats, v4.stats);
  assert.deepEqual(s.equip, plain(v4.equip));
  assert.deepEqual(s.inv, plain(v4.inv));
  assert.equal(s.settings.notation, 'sci');
  assert.equal(s.settings.autosave, 30);
  assert.equal(s.settings.autoSalvage, 2);
  assert.equal(s.settings.buyQty, 'max', 'MÁX agora é preservado');
  assert.equal(s.wallMax, v4.lastSave, 'v5: maior horário registrado começa no último salvamento');
  assert.equal(s.settings.musicVol, 0.6, 'campo novo recebe padrão');
});

test('3b. save v1 (sem verificação e com stats.time antigo) migra', () => {
  const v1 = old.defaults(); v1.v = 1; v1.stage = 12; v1.gold = 500; v1.stats.time = 999;
  const st = fakeStorage();
  st.setItem('laminaRunica.save.v1', JSON.stringify({ data: JSON.stringify(v1) }));
  const { L } = newGame(st);
  assert.equal(L.kind, 'ok');
  assert.equal(L.res.state.stage, 12);
  assert.equal(L.res.state.gold, 500);
  assert.equal('time' in L.res.state.stats, false);
});

test('4. gravação: envelope com versão/revisão, backup recebe o principal anterior válido', () => {
  const st = fakeStorage();
  const { api } = newGame(st);
  const s = api.defaults(); s.gold = 10;
  assert.equal(api.writeSave(s).ok, true);
  const first = st.getItem(api.consts.SAVE_KEY);
  s.gold = 20;
  const r2 = api.writeSave(s);
  assert.equal(r2.ok, true);
  assert.equal(r2.rev, 2);
  const env = JSON.parse(st.getItem(api.consts.SAVE_KEY));
  assert.equal(env.fmt, 2); assert.equal(env.v, 5); assert.equal(env.rev, 2); assert.ok(env.at > 0); assert.ok(env.tab);
  assert.equal(st.getItem(api.consts.BACKUP_KEY), first);
  assert.ok(st.getItem(api.consts.SNAP_KEY + '0'), 'primeira gravação da sessão cria cópia rotativa');
});

test('4b. compatibilidade reversa: o código ORIGINAL lê o save no formato novo', () => {
  const st = fakeStorage();
  const { api } = newGame(st);
  const s = api.defaults(); s.stage = 33; s.gold = 777;
  api.writeSave(s);
  const o = old.parseSave(st.getItem(api.consts.SAVE_KEY));
  assert.ok(o, 'versão anterior não pode ver o novo save como corrompido');
  assert.equal(o.stage, 33); assert.equal(o.gold, 777);
});

test('5. principal corrompido + backup válido → carrega o backup, principal não é apagado', () => {
  const st = fakeStorage();
  const { api } = newGame(st);
  const s = api.defaults(); s.stage = 40; api.writeSave(s);
  s.stage = 41; api.writeSave(s);
  const good = st.getItem(api.consts.SAVE_KEY);
  const bad = good.replace('\\"stage\\":41', '\\"stage\\":99');
  assert.notEqual(bad, good);          // altera dados sem atualizar a verificação
  st.setItem(api.consts.SAVE_KEY, bad);
  const { L } = newGame(st);
  assert.equal(L.kind, 'backup');
  assert.equal(L.mainError, 'checksum');
  assert.equal(L.res.state.stage, 40);
  assert.equal(st.getItem(api.consts.SAVE_KEY), bad, 'escolher o que carregar não grava nada');
});

test('5b. gravar depois de um principal ilegível guarda a cópia danificada antes', () => {
  const st = fakeStorage();
  const { api } = newGame(st);
  st.setItem(api.consts.SAVE_KEY, '{lixo');
  assert.equal(api.writeSave(api.defaults()).ok, true);
  assert.equal(st.getItem(api.consts.CORRUPT_KEY), '{lixo');
});

test('6. principal e backup ilegíveis, cópia rotativa válida → tela de recuperação, nada é escolhido sozinho', () => {
  const st = fakeStorage();
  const { api } = newGame(st);
  const s = api.defaults(); s.stage = 25; api.writeSave(s);
  st.setItem(api.consts.SAVE_KEY, 'não é json');
  st.setItem(api.consts.BACKUP_KEY, '{"data":"{}","h":"x"}');
  const snapshot = new Map(st._m);
  const { L } = newGame(st);
  assert.equal(L.kind, 'recover');
  assert.equal(L.mainError, 'json');
  assert.equal(L.candidates.length, 1);
  assert.equal(L.candidates[0].res.state.stage, 25);
  assert.deepEqual([...st._m], [...snapshot], 'armazenamento intacto');
});

test('6b. tudo ilegível → recuperação sem candidatos (nunca vira jogo novo em silêncio)', () => {
  const st = fakeStorage();
  st.setItem('laminaRunica.save.v1', '###');
  const { L } = newGame(st);
  assert.equal(L.kind, 'recover');
  assert.equal(L.candidates.length, 0);
});

test('7. principal ausente mas backup presente → recuperação (não carrega cópia antiga sem perguntar)', () => {
  const st = fakeStorage();
  const { api } = newGame(st);
  api.writeSave(api.defaults()); api.writeSave(api.defaults());
  st.removeItem(api.consts.SAVE_KEY);
  assert.equal(newGame(st).L.kind, 'recover');
});

test('8. save de versão futura → bloqueado, nunca rebaixado', () => {
  const st = fakeStorage();
  const raw = old.defaults(); raw.v = 99;
  const data = JSON.stringify(raw);
  st.setItem('laminaRunica.save.v1', JSON.stringify({ h: old.hash(data), data }));
  const { L } = newGame(st);
  assert.equal(L.kind, 'future');
});

test('9. estado com NaN/Infinity não é gravado; armazenamento fica como estava', () => {
  const st = fakeStorage();
  const { api } = newGame(st);
  api.writeSave(api.defaults());
  const before = st.getItem(api.consts.SAVE_KEY);
  const s = api.defaults(); s.gold = NaN;
  const r = api.writeSave(s);
  assert.equal(r.ok, false); assert.equal(r.error, 'invalid');
  s.gold = 1; s.stats.maxTap = Infinity;
  assert.equal(api.writeSave(s).error, 'invalid');
  assert.equal(st.getItem(api.consts.SAVE_KEY), before);
});

test('19. duas abas: a aba antiga não sobrescreve a revisão mais nova', () => {
  const st = fakeStorage();
  const A = newGame(st).api;
  const s = A.defaults(); s.stage = 10; assert.equal(A.writeSave(s).ok, true);
  const B = newGame(st).api;                                   // segunda aba abre e carrega o progresso
  const sb = plain(B.getS()); sb.stage = 11; assert.equal(B.writeSave(sb).ok, true);
  const newer = st.getItem(A.consts.SAVE_KEY);
  s.stage = 10; const r = A.writeSave(s);
  assert.equal(r.ok, false); assert.equal(r.error, 'conflict');
  assert.equal(st.getItem(A.consts.SAVE_KEY), newer);
  sb.stage = 12; assert.equal(B.writeSave(sb).ok, true, 'a aba mais nova continua salvando');
});

test('quota cheia: libera só cópias rotativas; se não couber, informa erro e não finge sucesso', () => {
  const st = fakeStorage({ quota: 60000 });
  const { api } = newGame(st);
  const s = api.defaults();
  assert.equal(api.writeSave(s, { snapshot: true }).ok, true);
  for (let i = 0; i < 3; i++) st.setItem(api.consts.SNAP_KEY + i, 'x'.repeat(12000));
  assert.equal(api.writeSave(s).ok, true, 'cabe depois de liberar as cópias rotativas');
  const big = api.defaults(); big.inv = []; big.created = 1;
  const tiny = fakeStorage({ quota: 100 });
  const t = loadCore(tiny);
  const r = t.writeSave(big);
  assert.equal(r.ok, false); assert.equal(r.error, 'quota');
  const blocked = loadCore(fakeStorage({ failSet: true }));
  assert.equal(blocked.Store.backend, null, 'armazenamento bloqueado é detectado na inicialização');
  assert.equal(blocked.writeSave(big).error, 'unavailable');
});

test('6/7. exportar e importar: ida e volta, e códigos do jogo ORIGINAL continuam aceitos', () => {
  const { api } = newGame(fakeStorage());
  const raw4 = representativeV4(old), v4 = plain(raw4);
  const oldCode = old.exportCodeOf(raw4);
  const r = api.importCodeChecked(oldCode);
  assert.equal(r.ok, true);
  assert.equal(r.state.gold, v4.gold); assert.equal(r.state.maxStage, 88);
  assert.deepEqual(plain(r.state.inv), plain(v4.inv));
  const s = api.defaults(); s.stage = 70; s.gold = 4.5e40;
  const code = api.exportCodeOf(s);
  const back = api.importCodeChecked(code);
  assert.equal(back.ok, true); assert.equal(back.state.gold, 4.5e40);
  assert.ok(old.importCode(code), 'versão anterior aceita o código novo');
  assert.equal(api.importCodeChecked(code.replace(/\.(\w+)$/, '\n.$1')).ok, true, 'quebras de linha ao colar são toleradas');
});

test('7. importação inválida é rejeitada com motivo', () => {
  const { api } = newGame(fakeStorage());
  const good = api.exportCodeOf(api.defaults());
  const cases = {
    empty: '', prefix: 'XYZ.abc.def', checksum: good.slice(0, -2) + 'zz', base64: 'LR1./w==.abc',
    too_big: 'LR1.' + 'A'.repeat(api.consts.MAX_CODE_CHARS + 10) + '.a',
  };
  for (const [err, code] of Object.entries(cases)) assert.equal(api.importCodeChecked(code).error, err, err);
  const trunc = good.slice(0, 40) + '.' + good.split('.')[2];
  assert.equal(api.importCodeChecked(trunc).ok, false, 'código cortado');
  const notSave = api.exportCodeOf({ hello: 'world' });
  assert.equal(api.importCodeChecked(notSave).error, 'fields');
  const fut = api.defaults(); fut.v = 42;
  assert.equal(api.importCodeChecked(api.exportCodeOf(fut)).error, 'future');
});

test('10. conteúdo hostil em save importado: HTML não sobrevive, protótipo intacto', () => {
  const { api } = newGame(fakeStorage());
  const s = plain(api.defaults());
  s.inv = [{ id: 5, slot: 'sword', rar: 2, lvl: 10, up: 0, model: 1, hue: 3, name: '<img src=x onerror=alert(1)>' }];
  s.equip.hat = { id: 6, slot: 'hat', rar: 9, lvl: -5, up: -1, model: 99, hue: -40, name: '<script>x</script>' };
  s.daily.last = '<b>2026</b>';
  s.settings.notation = '<svg onload=1>';
  s.quests.q0 = { type: '<i>x</i>', goal: 3, prog: 1, done: false };
  const json = JSON.stringify(s).replace('"arts":{}', '"arts":{"__proto__":{"polluted":1},"elmo":3,"fake":9}');
  const raw = JSON.parse(json);
  const r = api.importCodeChecked('LR1.' + Buffer.from(json, 'utf8').toString('base64') + '.' + api.hash(json));
  assert.equal(r.ok, true);
  const t = plain(r.state);
  assert.ok(!JSON.stringify(t).includes('<'), 'nenhum texto com < do save sobrevive');
  assert.equal(t.equip.hat.rar, 5); assert.equal(t.equip.hat.lvl, 1);
  assert.equal(t.arts.elmo, 3); assert.equal(t.arts.fake, undefined);
  assert.equal(({}).polluted, undefined);
  assert.ok(r.fixes.length > 0, 'correções são relatadas');
  assert.ok(raw);
});

test('valores impossíveis são corrigidos e relatados; ids duplicados ganham ids novos', () => {
  const { api } = newGame(fakeStorage());
  const s = plain(api.defaults());
  Object.assign(s, { gold: -50, stage: 0, hero: -3, wave: 77, pity: 500, ess: -2 });
  s.allies[0] = -9; s.settings.autosave = 0; s.settings.volume = 7;
  s.inv = [1, 2, 3].map(() => ({ id: 7, slot: 'ring', rar: 1, lvl: 5, up: 0, model: 0, hue: 0 }));
  const r = api.fromRawChecked(s);
  const t = r.state;
  assert.equal(t.gold, 0); assert.equal(t.stage, 1); assert.equal(t.hero, 1); assert.equal(t.wave, 9);
  assert.equal(t.pity, api.consts.PITY - 1); assert.equal(t.ess, 0); assert.equal(t.allies[0], 0);
  assert.equal(t.settings.autosave, 10); assert.equal(t.settings.volume, 1);
  const ids = t.inv.map(x => x.id);
  assert.equal(new Set(ids).size, 3);
  assert.ok(t.nextItemId > Math.max(...ids));
  assert.ok(r.fixes.includes('itemIds'));
});

test('17. progresso offline: limite de 12 h, sem negativos, relógio voltado não repete ganhos', () => {
  const { api } = newGame(fakeStorage());
  const H = 3600 * 1000, now = 1_800_000_000_000;
  assert.equal(api.offlineSeconds(now, now - 2 * H, 0), 7200);
  assert.equal(api.offlineSeconds(now, now - 30 * H, 0), api.consts.OFFLINE_CAP);
  assert.equal(api.offlineSeconds(now, now + H, 0), 0, 'último salvamento no futuro');
  assert.equal(api.offlineSeconds(now, NaN, NaN), 0);
  assert.equal(api.offlineSeconds(now, 0, 0), 0);
  // Adiantou 10 h, voltou o relógio e jogou (lastSave antigo), adiantou de novo: só conta além do maior horário já visto.
  assert.equal(api.offlineSeconds(now + 10 * H, now - H, now + 10 * H), 0);
  assert.equal(api.offlineSeconds(now + 11 * H, now - H, now + 10 * H), 3600);
});

test('18. números extremos: fórmulas não produzem NaN, ouro nunca vira Infinity', () => {
  const { api } = newGame(fakeStorage());
  for (const st of [1, 10, 100, 1000, 1699, 1700, 5000, 1e6]) {
    assert.ok(isFinite(api.hpFor(st)) && api.hpFor(st) > 0, 'hp ' + st);
    assert.ok(isFinite(api.goldFor(st)) && api.goldFor(st) > 0, 'ouro ' + st);
  }
  assert.equal(api.addCapped(api.consts.MAX_NUM, 1e308), api.consts.MAX_NUM);
  assert.equal(api.addCapped(5, NaN), 5);
  assert.equal(api.addCapped(5, -3), 5, 'ganho negativo é ignorado');
  const s = api.defaults();
  s.hero = 9_000_000; s.allies = s.allies.map(() => 5_000_000); s.gold = 1e300; s.stage = 1e6; s.runMaxStage = 1e6;
  s.arts = { elmo: 1e5, bolsa: 1e5, brac: 1e5, tambor: 1e5 };
  api.setS(s);
  for (const [name, v] of Object.entries({ tap: api.tapDmg(), dps: api.dps(), gps: api.goldPerSec(), hero1: api.heroCost(1), ess: api.essGain() }))
    assert.ok(!Number.isNaN(v), name + ' não pode ser NaN');
  assert.equal(api.maxN(5, 1.075, 9_000_000, 1e300), 0, 'custo infinito: nada a comprar, sem travar');
  assert.ok(api.maxN(5, 1.075, 0, 1e300) > 9000);
  assert.ok(api.fmt(1e300).length < 12);
  assert.equal(api.fmt(Infinity), '∞');
});

test('economia: custos acumulados conferem com a soma termo a termo', () => {
  const { api } = newGame(fakeStorage());
  let sum = 0;
  for (let i = 0; i < 37; i++) sum += 50 * Math.pow(1.07, 12 + i);
  assert.ok(Math.abs(api.costN(50, 1.07, 12, 37) - sum) / sum < 1e-12);
  for (const gold of [0, 49, 50, 1e4, 1e9, 1e30]) {
    const n = api.maxN(50, 1.07, 3, gold);
    assert.ok(n === 0 || api.costN(50, 1.07, 3, n) <= gold, 'maxN nunca excede o ouro');
    assert.ok(api.costN(50, 1.07, 3, n + 1) > gold, 'maxN é o máximo');
  }
});

test('resumo de save para a tela de confirmação', () => {
  const { api } = newGame(fakeStorage());
  const r = api.importCodeChecked(old.exportCodeOf(representativeV4(old)));
  const sum = plain(api.saveSummary(r.state));
  assert.equal(sum.maxStage, 88); assert.equal(sum.allies, 9); assert.equal(sum.items, 6); assert.equal(sum.prestiges, 3);
});

test('cópias de segurança nomeadas: gravam e leem sem interferir no principal', () => {
  const st = fakeStorage();
  const { api } = newGame(st);
  api.writeSave(api.defaults());
  const main = st.getItem(api.consts.SAVE_KEY);
  assert.equal(api.writeSafety('import', main), true);
  assert.equal(api.readSafety('import').save, main);
  assert.equal(api.readSafety('nada'), null);
  assert.equal(api.chooseLoad().kind, 'ok', 'cópias nomeadas não disparam recuperação');
});
