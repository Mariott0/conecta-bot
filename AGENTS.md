# AGENTS.md — Conecta Ofertas

## Repositório oficial

- Projeto: **Conecta Ofertas**
- Repositório: `Mariott0/conecta-bot`
- GitHub: https://github.com/Mariott0/conecta-bot
- Branch principal: `main`

## Arquivos obrigatórios de contexto

Antes de iniciar QUALQUER tarefa, o agente deve obrigatoriamente ler, nesta ordem:

1. `AGENTS.md`
2. `SKILL.md`
3. `memory.md`

Esses três arquivos formam a fonte principal de contexto operacional do projeto.

### Papel de cada arquivo

- `AGENTS.md`: regras globais que o agente deve obedecer.
- `SKILL.md`: contexto técnico, arquitetura e padrões de implementação do Conecta Ofertas.
- `memory.md`: memória viva do projeto, decisões tomadas, estado atual, tarefas pendentes, tarefas em andamento, tarefas concluídas e observações relevantes.

Se houver conflito entre arquivos, a prioridade é:

```text
AGENTS.md
→ instrução explícita atual do usuário
→ SKILL.md
→ memory.md
```

## Fluxo obrigatório do agente

Toda execução deve seguir este fluxo:

```text
1. Ler AGENTS.md
2. Ler SKILL.md
3. Ler memory.md
4. Identificar tarefa atual
5. Analisar código existente
6. Planejar alteração mínima necessária
7. Implementar
8. Executar testes
9. Corrigir erros encontrados
10. Reexecutar testes
11. Atualizar memory.md
12. Informar resultado
```

Nenhuma implementação é considerada concluída sem testes.

## Objetivo do projeto

O Conecta Ofertas é uma aplicação leve para localizar, analisar, organizar e preparar ofertas de marketplaces para divulgação por links de afiliado.

Fluxo inicial:

```text
Marketplace
→ Scanner
→ Consulta de preço
→ Cálculo de desconto
→ Filtros
→ SQLite
→ Painel web
→ Aprovação manual
→ Geração de mensagem
→ Postagem manual
```

A primeira versão NÃO deve automatizar publicação no WhatsApp.

## Ambiente alvo

Produção principal:

```text
Samsung Galaxy S10
ARM64
Termux
Ubuntu
Linux
Node.js
```

O sistema deve continuar leve porque o S10 pode executar outros serviços simultaneamente.

## Stack padrão

Usar preferencialmente:

- Node.js
- Express
- SQLite
- Axios
- node-cron
- dotenv
- HTML
- CSS
- JavaScript puro

Não adicionar sem necessidade explícita:

- React
- Vue
- Angular
- Next.js
- TypeScript
- Docker
- PostgreSQL
- Redis
- frameworks CSS pesados

## Regra de escopo

O agente deve executar somente a tarefa indicada em `memory.md` ou solicitada explicitamente pelo usuário.

Nunca implementar tasks futuras antecipadamente.

Se uma melhoria for encontrada fora do escopo:

- registrar em `memory.md` como sugestão/backlog futuro;
- não implementar sem autorização.

## Regra sobre memory.md

`memory.md` é o backlog e memória operacional oficial do projeto.

Toda tarefa deve possuir um estado:

```text
[ ] Pendente
[-] Em andamento
[x] Concluída
[!] Bloqueada
```

Ao iniciar uma task:

- marcar como `[-] Em andamento`.

Ao terminar com todos os testes aprovados:

- marcar como `[x] Concluída`;
- registrar data;
- registrar resumo curto;
- registrar testes executados.

Se os testes falharem e não puderem ser resolvidos:

- não marcar como concluída;
- usar `[!] Bloqueada` quando necessário;
- registrar o motivo no `memory.md`.

## Testes são obrigatórios

Após toda implementação, o agente deve testar o que foi alterado.

No mínimo, quando aplicável:

1. validar sintaxe;
2. instalar/verificar dependências;
3. iniciar aplicação;
4. testar endpoint ou fluxo alterado;
5. verificar logs e console;
6. validar banco/migration quando alterados;
7. executar testes automatizados existentes;
8. corrigir erros;
9. repetir os testes após correção.

Se ainda não existirem testes automatizados e a implementação permitir, criar testes adequados dentro do escopo da task.

Nunca declarar uma task como concluída apenas porque o código foi escrito.

Se algum teste não puder ser executado por limitação do ambiente, registrar isso claramente no `memory.md` e na resposta final.

## Não quebrar o projeto existente

Nunca:

- apagar funcionalidades válidas;
- substituir arquivos inteiros sem necessidade;
- alterar scripts de outros projetos do servidor;
- modificar configuração global do Termux;
- modificar Cloudflare automaticamente;
- alterar portas de outros serviços;
- apagar banco de dados automaticamente;
- alterar estrutura existente sem motivo técnico claro.

Prefira mudanças incrementais.

## APIs externas

Priorizar APIs oficiais.

### Mercado Livre

- usar documentação oficial atual;
- não inventar endpoints;
- não usar scraping quando existir API oficial adequada;
- tratar timeout;
- tratar HTTP 401, 403, 429 e 5xx;
- implementar retry apenas para erros temporários;
- nunca armazenar access token no código.

Se uma integração oficial não existir, documentar a limitação.

## Afiliados

Nunca inventar mecanismo de geração de link afiliado.

A lógica deve permanecer desacoplada do scanner.

Fallback aceitável:

```javascript
{
  success: false,
  originalUrl: productUrl,
  affiliateUrl: null,
  requiresManualGeneration: true
}
```

## WhatsApp

Na versão inicial, permitir apenas:

- gerar mensagem;
- copiar mensagem;
- copiar link;
- organizar ofertas;
- marcar oferta como postada.

Não implementar sem task específica:

- disparo em massa;
- spam;
- automação não oficial de WhatsApp Web;
- bibliotecas que simulem cliente WhatsApp.

## Segurança

Nunca commitar:

```text
.env
tokens
senhas
cookies
credenciais
chaves privadas
```

Manter `.env.example` sem segredos reais.

Usar prepared statements no SQLite.

Validar payloads de entrada.

## Git

- Branch principal: `main`.
- Não usar force push na `main`.
- Não apagar histórico.
- Evitar commits gigantes.
- Usar mensagens de commit objetivas.
- Antes de concluir, revisar diff e garantir que nenhum segredo foi incluído.

## Formato da resposta ao concluir uma task

### Implementado
Resumo curto.

### Arquivos alterados
Lista objetiva.

### Testes executados
Listar comandos/testes e resultado.

### Resultado
Informar se a task foi concluída ou ficou bloqueada.

### Próxima task
Apenas informar a próxima task existente em `memory.md`. Não começar automaticamente.

## Regra principal

**Ler `AGENTS.md`, `SKILL.md` e `memory.md` antes de qualquer trabalho, executar somente a task atual, testar toda implementação e atualizar `memory.md` antes de encerrar.**
