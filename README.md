# 🛡️ homelab-ti — Laboratório de Varredura e Análise de Vulnerabilidades

> Laboratório realizado em **ambiente próprio e isolado** (máquinas virtuais numa rede host-only, sem acesso à internet), apenas para fins de estudo. Nenhum sistema de terceiros foi testado.

## 🎯 Objetivo

Praticar o ciclo básico de identificação de vulnerabilidades usando ferramentas presentes no dia a dia de suporte e segurança:

- Descobrir serviços e portas abertas com **Nmap**
- Fazer a varredura de vulnerabilidades com **OpenVAS / Greenbone**
- Validar uma vulnerabilidade de forma controlada com **Metasploit**

Como parte do lab, também **diagnostiquei e corrigi uma falha no feed de vulnerabilidades (NVT)** do OpenVAS que impedia a detecção — registrada na seção 2.

## 🖥️ Ambiente

| Máquina | Sistema | Função |
| --- | --- | --- |
| Atacante | Kali-Linux (OpenVAS, Nmap e Metasploit) | Varredura e análise |
| Alvo | Metasploitable 2 | Máquina vulnerável de propósito |

- **Virtualização:** VirtualBox
- **Rede:** adaptador em modo **Host-only**, sem saída para a internet — isolamento do laboratório
- **Hardware:** PC com 8 GB de RAM (1 a 2 VMs por vez)


## 🔍 1. Reconhecimento com Nmap

Levantamento das portas abertas e das versões dos serviços do alvo.

```bash
nmap -sV [IP do alvo]
```

`-sV` identifica a versão de cada serviço, o que já aponta software desatualizado e conhecido por ser vulnerável.

![Resultado do Nmap](prints/01-nmap.png)

**Principais portas encontradas:** *(preencher a partir do seu print)*

| Porta | Serviço | Versão | Observação |
| --- | --- | --- | --- |
| [preencher] | [preencher] | [preencher] | [preencher] |

## 📋 2. Varredura de vulnerabilidades com OpenVAS

Scan do tipo **"Full and fast"** contra o alvo.

### Correção do feed NVT

No primeiro scan, a varredura concluía sem apontar vulnerabilidades. Investiguei e identifiquei que a **base de vulnerabilidades (feed NVT) não estava sincronizada/atualizada**, o que impedia a detecção. Após [preencher: o que você fez — ex.: rodar a sincronização do feed com `greenbone-nvt-sync` e reiniciar os serviços / aguardar a reconstrução da base], o scan passou a retornar os resultados corretamente.

> *Esse foi o ponto mais importante do lab: a diferença entre "nenhuma vulnerabilidade" e "a ferramenta não estava pronta para encontrá-las".*

![Relatório do OpenVAS](prints/02-openvas.png)

**Resumo do relatório:** *(preencher a partir do seu print)*

- Críticas: [nº] · Altas: [nº] · Médias: [nº] · Baixas: [nº]

**Vulnerabilidades em destaque:**

1. **[Nome / CVE]** — [o que é, em uma linha]
2. **[Nome / CVE]** — [...]

## ⚙️ 3. Validação com Metasploit

Para confirmar que uma das vulnerabilidades era realmente explorável, usei o Metasploit em uma exploração controlada.

**Vulnerabilidade escolhida:** [preencher: nome / CVE do serviço que você explorou]

```
msfconsole
search [serviço]
use [caminho do módulo]
set RHOSTS [IP do alvo]
run
```

![Sessão no Metasploit](prints/03-metasploit.png)

**Resultado:** obtive uma sessão no alvo e confirmei o acesso com `whoami` / `id`. Isso prova que a falha não era só teórica — era explorável no ambiente.

## 🛠️ 4. Recomendações de correção

| Problema | Correção recomendada |
| --- | --- |
| Serviço desatualizado | Atualizar para versão suportada ou desativar, se não for necessário |
| Portas e serviços desnecessários abertos | Fechar no firewall e desabilitar o serviço |
| Credenciais fracas ou padrão | Trocar senhas e aplicar política de senhas |

## 📚 O que aprendi

- Ler a saída do Nmap para relacionar **porta → serviço → versão** e identificar alvos prováveis.
- Que uma ferramenta de varredura só serve se a **base de dados estiver atualizada** — diagnosticar o feed NVT foi tão importante quanto rodar o scan.
- A diferença entre **encontrar** uma vulnerabilidade e **confirmar** que ela é explorável.
- Como manter sistemas atualizados reduz a superfície de ataque — ligação direta com o trabalho de suporte e hardening.

## 🧰 Ferramentas

`Nmap` · `OpenVAS / Greenbone` · `Metasploit Framework` · `VirtualBox` · `Debian` · `Metasploitable 2`

---

**Autor:** Matheus Garcia · Engenheiro da Computação · Pós-graduação em Cibersegurança
[LinkedIn](https://linkedin.com/in/matheus-garcia29) · [GitHub](https://github.com/GarciaZn015)
