# ⚔️ Lâmina Rúnica — jogo de toque (clicker RPG)

Jogo de toque no estilo "tap RPG" feito em um único arquivo `index.html` (HTML + CSS + JavaScript puro, sem dependências).
Funciona no navegador do celular ou do computador.

## Como jogar

Abra `index.html` no navegador (ou publique a pasta no GitHub Pages).

- **Toque no monstro** para atacar. Derrote 10 monstros e enfrente o **chefe** antes que o tempo acabe.
- Se o chefe escapar, você continua enfrentando monstros comuns para juntar ouro. Toque em **Desafiar chefe** para tentar de novo, ou deixe o desafio automático ligado.
- **Herói**: aumenta o dano de toque (×1,75 a cada 10 níveis).
- **Aliados**: 16 criaturas místicas sorteadas a cada novo jogo (fênix, grifo, dragão, raposa espiritual, unicórnio, coruja arcana, tartaruga ancestral, lobo lunar, serpente alada e cervo estelar). Causam dano mesmo com o jogo fechado (×2 no nível 10 e ×4 a cada 25 níveis). A cena mostra só as 6 mais fortes, para não poluir a tela.
- **Poderes**: Raio Celeste, Fúria das Lâminas, Chuva de Ouro e Grito de Guerra. Gastam mana e têm recarga.
- **Relíquias**: a partir do estágio 40 você pode **Renascer** e ganhar essências. Cada essência dá +10% de dano para sempre e serve para comprar artefatos permanentes.
- 8 regiões com cenário próprio, monstros gerados proceduralmente e o raro **Baú Vivo**, que solta 12× mais ouro.
- **Muros com plataformas** nas laterais do mapa: as criaturas mais fortes ficam nelas (2 a 4 por lado, conforme o tamanho da tela). Nos níveis 50, 100 e 200 a criatura evolui de aparência.
- **Trocar criatura**: toque na imagem do aliado para sortear outra (a primeira troca é grátis, depois custa 1 essência).
- **Chefe Ancestral** a cada 10 estágios: mais forte, dá o dobro de ouro e +2 essências na primeira vitória.
- **Missões diárias**: 3 missões por dia com ouro, e um baú de +2 essências ao concluir todas.
- **Música de fundo** gerada pelo próprio jogo (pode desligar nas configurações).
- **Espírito Errante**: de tempos em tempos passa voando. Toque nele para ganhar ouro, mana cheia ou um poder grátis.
- **Combo**: toques rápidos seguidos aumentam o dano em até +40%.
- **Conquistas** com estrelas que dão essências, e **recompensa diária** com sequência de 7 dias.
- Bolinha vermelha nas abas quando há algo para comprar ou resgatar; selo "melhor compra" nos aliados; segure o botão para comprar várias vezes.
- Painel recolhível (seta ao lado das abas) e opção de tela cheia para aumentar a área de batalha.
- Atalhos no computador: `Espaço` ataca, `1` a `4` usam os poderes.

## Equipamentos

O herói tem 4 espaços: **Espada** (dano de toque), **Chapéu** (todo o dano), **Roupa** (dano dos aliados) e **Anel** (ouro).
Cada item muda a aparência do herói (5 espadas, 5 chapéus, 4 roupas e 3 anéis, com cor e brilho da raridade).

| Raridade | Chefe comum | Chefe Ancestral | Bônus base |
| --- | --- | --- | --- |
| Comum | 55% | 0% | 10% |
| Incomum | 25% | 40% | 20% |
| Raro | 12% | 30% | 40% |
| Épico | 5,5% | 18% | 80% |
| Lendário | 2% | 9% | 160% |
| Mítico | 0,5% | 3% | 320% |

- Chance de item: 25% por chefe, 100% no Chefe Ancestral e 15% no Baú Vivo.
- O nível do item acompanha o estágio (−2 a +3; Ancestral +5). 8% dos itens são **Excepcionais**, com 10 a 20 níveis a mais.
- O bônus cresce com o nível: `bônus = base × (1 + nível/10) × (1 + 0,1 × melhorias)`.
- Raro ou melhor ganha um bônus secundário (crítico, dano crítico, mana, tempo contra chefes ou ouro).
- **Sorte acumulada**: cada item sem Lendário aumenta a chance de Lendário e Mítico, e o 40º é garantido.
- Itens desmanchados viram fragmentos, que melhoram o item equipado (+10% por nível). Há desmanche automático opcional.

## Ranks dos aliados

A cada 25 níveis o aliado ganha uma estrela. A cada 5 estrelas o rank muda de cor:
Bronze → Prata → Ouro → Esmeralda → Safira → Ametista → Rubi → Celestial (cor animada).
As estrelas aparecem na lista e na plataforma de cada criatura. A partir de Ouro, a criatura ganha uma coroa.

## Salvamento

- **Automático** a cada 5, 10, 30 ou 60 s (configurável), ao comprar algo, ao vencer um chefe, ao renascer, ao sair ou trocar de aba.
- Cada gravação é **validada antes** (nenhum número inválido é gravado) e **conferida depois** (o jogo lê de volta o que gravou). Se falhar, aparece o aviso **⚠ Não salvo** no topo da batalha, com opção de tentar de novo e de baixar o código de backup. O jogo nunca mostra “salvo” sem ter salvado.
- **Cópias**: o principal anterior vira backup, e até 3 cópias rotativas são guardadas (no máximo uma a cada 10 min, e também ao renascer e ao importar).
- **Recuperação**: se o principal estiver danificado e o backup estiver bom, o backup é carregado e o jogo avisa. Se nenhuma cópia recente servir, abre a tela **Recuperar progresso** com as cópias disponíveis, a opção de exportar os dados brutos e, só com confirmação, a de começar de novo. O salvamento danificado **nunca é apagado** automaticamente.
- **Duas abas**: cada gravação leva um número de revisão. Se outra aba salvar um progresso mais novo, a aba antiga pausa e para de salvar, em vez de sobrescrever.
- **Progresso offline**: até 12 h, contado a partir do maior horário já registrado. Voltar o relógio do aparelho não repete ganhos (e não reabre recompensa diária nem missões).
- **Exportar e importar**: em Configurações, gere um código `LR1.…` (ou baixe um arquivo). Ao importar, o jogo mostra um resumo dos dois progressos, guarda uma cópia do atual e só então troca. A cópia aparece em **Cópias de segurança guardadas** e pode ser restaurada. Códigos antigos continuam válidos.
- **Apagar progresso** pede confirmação dupla e guarda uma cópia restaurável.

### Link compartilhado × progresso

O progresso fica no armazenamento do navegador (`localStorage`), separado por navegador, perfil e endereço do site.

- Abrir o link do jogo pela primeira vez cria um jogo novo. Compartilhar o link **não** envia o seu progresso.
- Quem já joga naquele navegador continua com o próprio save.
- Outro domínio ou subdomínio (outra hospedagem, versão de teste) tem armazenamento separado: o progresso **não** passa sozinho de um para o outro. Use o código de backup.
- Nada é importado automaticamente pela URL.
- Quando o jogo roda no claude.ai com login, o progresso também é salvo na sua conta. Se a conta tiver um progresso diferente do deste aparelho, o jogo pergunta qual usar e guarda o outro como cópia.

### Limitações honestas

- A verificação de integridade (FNV-1a) detecta **corrupção acidental**. Ela não impede quem controla o navegador de editar o próprio save, e o jogo não tenta fingir o contrário.
- A data e a hora vêm do aparelho. As proteções contra relógio alterado reduzem abusos simples, mas não existe relógio confiável sem servidor.
- O modo privado de alguns navegadores bloqueia ou apaga o armazenamento ao fechar. Nesse caso o jogo avisa e o código de backup é o único jeito de guardar o progresso.

## Testes

```
node --test tests/core.test.mjs
```

São 23 testes, sem dependências (Node 18 ou mais novo), com saves fictícios em um armazenamento falso em memória. Cobrem migração de saves reais da versão anterior (gerados pelo próprio código original, guardado em `_backup_original_2026-10-31/`), compatibilidade nos dois sentidos, corrupção e recuperação, duas abas, quota cheia, armazenamento bloqueado, importação válida e hostil, progresso offline, relógio voltado e números extremos.

Os ganchos de teste no navegador só existem abrindo o jogo com `#teste` no fim do endereço.

## Tempo de jogo

As estatísticas separam **tempo jogando (ativo)**, que só conta se você tocou nos últimos 90 s, **tempo com o jogo aberto** e **tempo fora (offline)**.

## Configurações

Sons (com botão de silenciar no topo), volume dos efeitos e da música, vibração, texto maior, reduzir movimento, números de dano, partículas, tremor de tela, notação dos números (K/M/B ou científica),
intervalo do salvamento automático, desafio automático do chefe, resumo ao voltar, backup e apagar progresso.
