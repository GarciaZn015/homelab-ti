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
- **Espírito Errante**: de tempos em tempos passa voando. Toque nele para ganhar ouro, mana cheia ou um poder grátis.
- **Combo**: toques rápidos seguidos aumentam o dano em até +40%.
- **Conquistas** com estrelas que dão essências, e **recompensa diária** com sequência de 7 dias.
- Bolinha vermelha nas abas quando há algo para comprar ou resgatar; selo "melhor compra" nos aliados; segure o botão para comprar várias vezes.
- Painel recolhível (seta ao lado das abas) e opção de tela cheia para aumentar a área de batalha.
- Atalhos no computador: `Espaço` ataca, `1` a `4` usam os poderes.

## Salvamento

- **Automático** a cada 5, 10, 30 ou 60 s (configurável), ao comprar algo, ao vencer um chefe e ao sair ou trocar de aba.
- Cada salvamento tem verificação de integridade e mantém uma **cópia de backup**. Se o principal estiver corrompido, o backup é carregado.
- **Progresso offline**: ao voltar, seus aliados terão coletado ouro pelo tempo que você ficou fora (até 12 h).
- **Exportar e importar**: em Configurações, gere um código de backup para guardar ou levar para outro aparelho.

## Tempo de jogo

As estatísticas separam **tempo jogando (ativo)**, que só conta se você tocou nos últimos 90 s, **tempo com o jogo aberto** e **tempo fora (offline)**.

## Configurações

Efeitos sonoros e volume, vibração, números de dano, partículas, tremor de tela, notação dos números (K/M/B ou científica),
intervalo do salvamento automático, desafio automático do chefe, resumo ao voltar, backup e apagar progresso.
