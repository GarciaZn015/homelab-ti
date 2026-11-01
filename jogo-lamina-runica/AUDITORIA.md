# Auditoria e evolução — etapa 1 (31/10/2026)

Estado de continuidade para as próximas etapas. O original está intacto em `_backup_original_2026-10-31/` (SHA-256 `66bd2ea3…f4c`).

## Formato do save

| Chave (`localStorage`) | Conteúdo |
| --- | --- |
| `laminaRunica.save.v1` | Principal. Envelope `{fmt:2, v, rev, at, tab, h, data}`; `data` = JSON do estado; `h` = FNV-1a de `data`. A versão anterior grava `{h, data}` e as duas leem os dois formatos. |
| `laminaRunica.backup.v1` | O principal anterior, copiado só se estava legível. |
| `laminaRunica.snap.0..2` | Cópias rotativas (no máximo uma a cada 10 min, mais renascimento, importação e “Salvar agora”). |
| `laminaRunica.safety.<motivo>` | `{reason, at, save}` antes de importar, apagar, trocar pela nuvem, corrigir valores ou recomeçar na recuperação. Só é carregada se o jogador pedir. |
| `laminaRunica.corrupt` | Cópia intacta do último principal ilegível. |
| `laminaRunica.tab` | Aba do painel aberta (preferência local). |

Versão do estado: **5**. As migrações ficam em `MIGRATIONS` (`index.html`, bloco `@core`). A v5 só acrescenta `wallMax` (maior horário já registrado), `settings.musicVol`, `settings.reduceMotion` e `settings.bigText`. Nenhuma migração altera ouro, níveis, itens ou quantidades. Um save legítimo da v4 passa com **zero correções** (teste 2/3).

## Problemas encontrados e corrigidos

**P0: integridade dos saves**
1. **Reset silencioso**: se o principal e o backup falhassem, o jogo criava um jogo novo e o gravava por cima; o save original sumia em ~10 s. Agora abre a tela de recuperação, bloqueia gravações e nunca apaga o original.
2. O backup era só o save de 10 s antes. Agora há também 3 cópias rotativas e cópias de segurança nomeadas.
3. `Infinity`/`NaN` viravam `null` no JSON e o ouro voltava a 0 ao carregar. Agora todo ganho de ouro passa por um teto (`MAX_NUM = 1e305`) e o estado é validado antes de gravar.
4. Duas abas se sobrescreviam. Agora cada gravação tem revisão e id de aba; a aba antiga pausa (evento `storage` + checagem na gravação).
5. A importação substituía tudo sem cópia restaurável. Agora decodifica em memória, mostra resumo comparativo, guarda cópia, aplica tudo ou nada e permite desfazer.
6. A nuvem (claude.ai) trocava o save local sem perguntar. Agora pergunta, a não ser que o aparelho esteja no começo do jogo, e guarda o outro lado como cópia.
7. **XSS por importação**: o nome do item vinha do save e entrava via `innerHTML`. Agora o nome é sempre recalculado e todos os campos de texto do save são validados.
8. Falhas de gravação (quota, modo privado) só apareciam no salvamento manual. Agora há aviso persistente, mensagem clara e download do código.
9. Save de versão mais nova seria rebaixado em silêncio. Agora fica bloqueado para leitura, com explicação.

**P1: bugs de jogo**
- “MÁX” na quantidade de compra nunca ficava salvo (o tipo era diferente do padrão).
- Segurar Espaço gerava auto-repeat de toques (autoclicker). Agora só um toque por pressionamento; os poderes também aceitam o teclado numérico.
- Item do Baú Vivo não agendava salvamento.
- Ganho offline podia ser reaplicado após uma falha antes do autosave (agora salva logo após aplicar), e o ciclo de adiantar e voltar o relógio repetia ganhos.
- A recompensa diária e as missões podiam ser refeitas voltando o relógio.
- Ids de item duplicados num save adulterado deixavam equipar e desmanchar ambíguos.
- Valores impossíveis (negativos, fora do intervalo, artefatos e conquistas inexistentes) agora são corrigidos, relatados ao jogador, e o original fica guardado.

## Verificado sem precisar de mudança
- Chance de raridade sorteada 20.000 vezes: 54,9 / 25,3 / 11,9 / 5,3 / 2,0 / 0,56 %, igual à tabela do README.
- Sorte acumulada: com 39 itens sem Lendário, o próximo sai sempre Lendário ou Mítico (2.000 sorteios).
- Desmanche, missões, recompensa diária, conquistas e renascimento são idempotentes: um segundo clique não paga de novo.
- Fuga do chefe → modo treino → desafio automático após 10 monstros → vitória sobe exatamente 1 estágio.

## Economia (análise; nenhum valor foi alterado)
- (Valores revisados em 01/11/2026, ver a seção "Revisão de equilíbrio".) A vida dos monstros e o ouro crescem ×1,55 por estágio. O herói custa ×1,075 por nível (×2,06 a cada 10 níveis, com dano ×1,6 a cada 10 níveis mais o crescimento linear).
- `hpFor` tem teto de 1e300, alcançado por volta do estágio 1.700. Depois disso a vida e o ouro param de crescer. É um teto de progressão inalcançável na prática; está documentado e não foi mudado.
- Custos acima de ~1,8e308 viram `Infinity`, e nesse caso a compra fica indisponível sem travar (teste 18). Não foi adotada biblioteca de números grandes: o `Number` cobre todo o alcance jogável, e trocar mudaria fórmulas e saves sem ganho real.
- O ataque automático da Fúria das Lâminas conta como toque nas estatísticas e na conquista “Dedos Ligeiros”, como antes. Mudar isso mexeria em progresso existente; fica para decisão sua.

## Visual e interface implementados nesta etapa
- Cenário próprio para cada uma das 8 regiões (moinho e trigo, pinheiros e cogumelos luminosos, árvores mortas e névoa, picos nevados e gelo, obeliscos, dunas e vidro, estalactites e cristais, torres e lava, nebulosa, planeta e rochas flutuantes), com variação a cada estágio e desenhado uma vez em cache.
- Partículas ambientes por região, transição com o nome da região e entrada do chefe com faixa e contagem de tempo. Borda pulsante enquanto o chefe vive, mais forte nos últimos 5 s.
- Círculo rúnico girando sob o Chefe Ancestral, monstros que caem do alto ao entrar, explosão rúnica ao derrotar, variante rara “✦” (só aparência), aura dourada do Baú Vivo.
- Hierarquia de efeitos: toque < crítico (anel) < Raro (anel) < Épico (anel rúnico) < Lendário/Mítico (coluna de luz + clarão). Herói com pose de vitória e de recuo quando o chefe escapa, e um pouco maior.
- Layout em duas colunas no desktop e no celular deitado (a cena passou de ~200 px para ~420 px de altura em 1036×558). No celular em retrato, a cena ficou com 316 px em vez de 265 px. Os avisos não cobrem mais a barra de tempo do chefe.
- Poderes com nome e tecla, além do ícone. Botão de silenciar. Volume separado para música e efeitos. Aviso quando o navegador bloqueia o áudio. “Texto maior” e “Reduzir movimento” (também respeita a preferência do sistema).

## Testes executados (resultados reais)
- `node --test tests/core.test.mjs` (na raiz do repositório): **23/23 passaram**.
- Navegador Chromium (Playwright, servidor local), em perfis de teste isolados, sem o save real:
  - jogador novo, combate, compra, recarga com o progresso mantido;
  - principal corrompido → backup carregado, cópia danificada preservada;
  - principal e backup corrompidos → tela de recuperação, 3 cópias listadas, nenhuma gravação em 12 s;
  - duas abas → a antiga pausa sem sobrescrever;
  - perfil isolado (“link compartilhado”) → jogo novo;
  - importação inválida rejeitada com motivo; importação válida com resumo, clique duplo inofensivo, desfazer funcionando;
  - offline de 3 h aplicado uma vez só;
  - 60 fps com 300 toques rápidos, 7 MB de heap, nenhum erro de script.
- **Não testado**: celulares reais, iPhone/Safari, Firefox. As medidas de desempenho foram feitas em CPU de desktop.

## Pendências recomendadas (próximas etapas)
1. Testar em Android Chrome e iPhone Safari reais (o `zoom` de “Texto maior” exige Safari 17+ ou Firefox 126+; em navegadores antigos a opção não faz efeito).
2. P2 restante: animações próprias para cada uma das 10 espécies de aliado nos níveis 50/100/200 (hoje a evolução é coroa, aura e escala), mais variedade de silhuetas de monstros por região e ataques visuais dos chefes.
3. Interface: prévia lado a lado ao equipar item, tooltips curtos, estados vazios ilustrados.
4. Decisões de regra que dependem de você: estatística de toques da Fúria; teto de progressão no estágio ~1.700.
5. ~~Versionar o projeto com Git~~: feito. O projeto está no repositório `homelab-ti`, pasta `jogo-lamina-runica/`.

## Ajustes após subir para o repositório (01/11/2026)
- `tests/harness.mjs` procurava `index.html` na raiz do repositório; agora aponta para `jogo-lamina-runica/index.html`. Antes disso os 23 testes falhavam com "arquivo não encontrado".
- Barra superior no celular em pé (até 480 px): o nome da região não é mais cortado e o estágio não quebra linha. O texto da onda some nessa largura, e o progresso continua nos pontinhos logo abaixo.
- Abas no computador e no celular deitado: os nomes não se encostam mais.
- O README do laboratório de segurança voltou para a raiz, e o do jogo está em `jogo-lamina-runica/README.md`.

## Revisão de equilíbrio (01/11/2026)

Relato do jogador: "não consigo tocar para bater, e os aliados matam tão rápido que quase não vejo os monstros".

**Causa.** O toque era registrado, mas os monstros morriam em menos de 0,05 s e o jogo passava a maior parte do tempo no intervalo entre um monstro e outro, onde o toque não fazia nada. Uma simulação com compras otimizadas (5 toques/s) mostrou que o jogo estava fácil demais:
- primeira jornada: do estágio 4 ao 40, um toque matava qualquer monstro, e o estágio 100 chegava em 90 min sem renascer;
- depois de renascer (40 essências, Elmo 5, Tambor 4): aliados matavam em 0,03 s por mais de 100 estágios;
- com itens Épicos de nível 50: o mesmo por 150 estágios.

**Mudanças.**
| | Antes | Agora |
| --- | --- | --- |
| Vida por estágio | ×1,5 | ×1,55 |
| Ouro por monstro | vida/6 | vida/15 |
| Dano do herói a cada 10 níveis | ×1,75 | ×1,6 |
| Bônus do item pelo nível | 1 + nível/10 | 1 + nível/40 |
| Intervalo entre monstros | 0,4 s | 0,25 s |
| Aliados atacam | desde o surgimento | após 0,3 s (fim da entrada) |

Novidades: **avanço rápido** (aliados matam em menos de 0,1 s → cada vitória conta 4 monstros, com o ouro pago), sem faixa nem vibração de chefe nesse modo (exceto Ancestral), e toques entre monstros mostram o golpe e mantêm o combo.

**Resultado na simulação.** Primeira jornada: estágio 20 em 4,5 min (~7 toques por monstro), estágio 40 em 22 min (~90 toques, aliados ~5 s), trava entre 40 e 60, que é o ponto de renascer. Depois de renascer, os estágios iniciais passam depressa (até o 80 em ~8 min, ou ~3 min com itens Épicos), com cada monstro visível por pelo menos 0,3 s.

**Efeito em saves existentes.** Nenhum valor salvo muda. No mesmo estágio, os monstros ficam mais resistentes (no estágio 80, ~13× mais vida) e os itens ficam mais fracos (um Épico de nível 50 passa de ×5,8 para ×2,8). Quem estava muito avançado pode travar num chefe e precisar juntar ouro ou renascer, como esperado num clicker.
