# memory.md — Conecta Ofertas

## Função deste arquivo

Este arquivo é a **memória operacional e backlog oficial** do projeto Conecta Ofertas.

O agente deve ler este arquivo antes de qualquer implementação, junto com:

1. `AGENTS.md`
2. `SKILL.md`
3. `memory.md`

As tarefas do projeto ficam aqui.

## Estados de tarefa

```text
[ ] Pendente
[-] Em andamento
[x] Concluída
[!] Bloqueada
```

## Regra de conclusão

Uma task só pode ser marcada como `[x] Concluída` depois de:

1. implementação finalizada;
2. validação de sintaxe;
3. aplicação iniciando corretamente, quando aplicável;
4. endpoint/fluxo alterado testado;
5. logs verificados;
6. erros encontrados corrigidos;
7. testes executados novamente após correções;
8. resultado registrado nesta memória.

Se um teste obrigatório não puder ser executado, registrar explicitamente a limitação e não fingir que foi validado.

---

# Estado atual do projeto

## Projeto

- Nome público: **Conecta Ofertas**
- Repositório: `Mariott0/conecta-bot`
- Branch principal: `main`
- Produção prevista: Samsung Galaxy S10 / Termux / Ubuntu / ARM64
- Stack base: Node.js + Express + SQLite + HTML/CSS/JS
- Porta planejada inicialmente: `3100`

## Decisões já tomadas

- O sistema será leve e adequado ao S10.
- O Mercado Livre será o primeiro marketplace.
- Shopee e outros marketplaces ficam para fases futuras.
- Na primeira versão não haverá postagem automática no WhatsApp.
- O sistema deve encontrar ofertas, filtrar, salvar, permitir aprovação e gerar mensagem pronta.
- Links afiliados devem usar integração oficial quando disponível; nunca inventar API.
- Não usar scraping quando API oficial resolver.
- Não usar Docker inicialmente.
- Não usar React/Next.js/TypeScript inicialmente.
- SQLite será o banco inicial.
- Toda implementação exige testes antes de ser considerada concluída.

---

# BACKLOG

## FASE 1 — Fundação

### [x] TASK 01 — Inicializar projeto Node.js

Objetivo:

Criar a estrutura inicial do projeto `conecta-bot`.

Requisitos:

- inicializar `package.json`;
- instalar Express;
- instalar Axios;
- instalar SQLite;
- instalar node-cron;
- instalar dotenv;
- criar estrutura de diretórios;
- criar `.gitignore`;
- criar `.env.example`;
- criar servidor Express;
- utilizar `PORT=3100` como padrão;
- adicionar `GET /api/health`.

Retorno esperado:

```json
{
  "status": "ok",
  "service": "conecta-ofertas"
}
```

Testes obrigatórios:

- `npm install` sem erro;
- validação de sintaxe;
- iniciar servidor;
- chamar `/api/health`;
- confirmar HTTP 200 e JSON esperado.

Conclusão em **2026-09-03**:

- inicializado o projeto Node.js com Express, Axios, SQLite, node-cron e dotenv;
- criada a estrutura `src/` (`config`, `database`, `jobs`, `routes`, `services`, `utils`), `public/`, `data/`, `logs/` e `test/`;
- adicionados `.gitignore`, `.env.example`, scripts de execução/teste e servidor Express com porta padrão `3100`;
- implementado `GET /api/health` com o retorno esperado;
- criado teste automatizado de integração para o health check.

Testes executados:

- `npm.cmd install`: concluído sem erro, 139 pacotes auditados e 0 vulnerabilidades;
- `node --check` em todos os arquivos JavaScript do projeto: aprovado;
- `npm.cmd ls --depth=0`: dependências instaladas e árvore válida;
- `npm.cmd test`: 1 teste aprovado, 0 falhas;
- `npm.cmd start`: servidor iniciado corretamente na porta padrão `3100`;
- `Invoke-WebRequest http://127.0.0.1:3100/api/health`: HTTP 200, JSON `{"status":"ok","service":"conecta-ofertas"}`;
- `git diff --check`: aprovado.

---

### [ ] TASK 02 — Banco SQLite

Criar banco SQLite e tabela `offers`.

Campos iniciais:

```text
id
marketplace
external_id
title
category
price_current
price_original
discount_percent
permalink
affiliate_url
thumbnail
free_shipping
condition
seller_id
seller_reputation
reviews_average
reviews_count
status
created_at
updated_at
posted_at
```

Status:

```text
pending
approved
rejected
posted
expired
```

Criar índice único:

```text
marketplace + external_id
```

Funções iniciais:

```text
insertOffer
findOfferByExternalId
listOffers
updateOfferStatus
```

Adicionar:

```text
GET /api/offers
```

Testes obrigatórios:

- migration cria banco do zero;
- migration pode rodar novamente sem quebrar;
- insert funciona;
- duplicidade é impedida;
- listagem funciona;
- atualização de status funciona.

---

## FASE 2 — Mercado Livre

### [ ] TASK 03 — Serviço de busca Mercado Livre

Criar `mercadolivre.service.js`.

Métodos previstos:

```text
searchProducts(query, options)
getItemDetails(itemId)
getItemsBulk(itemIds)
```

Usar API oficial atual.

Criar endpoint temporário:

```text
GET /api/ml/search?q=ssd
```

Retorno simplificado:

```text
id
title
price
permalink
thumbnail
condition
shipping
seller
```

Testes obrigatórios:

- busca real na API;
- timeout tratado;
- resposta inválida tratada;
- 429 tratado conforme estratégia implementada;
- endpoint local retorna formato normalizado.

---

### [ ] TASK 04 — Serviço de preços e desconto

Criar serviço responsável por obter preço atual e preço regular usando endpoints oficiais atuais do Mercado Livre.

Retorno interno:

```javascript
{
  currentPrice,
  regularPrice,
  discountPercent,
  promotionId,
  promotionType
}
```

Criar utilitário de desconto.

Endpoint de teste:

```text
GET /api/ml/item/:id/price
```

Testes obrigatórios:

- produto sem desconto retorna 0%;
- produto com desconto calcula corretamente;
- valores inválidos não geram `NaN`;
- endpoint retorna estrutura normalizada.

---

### [ ] TASK 05 — Filtros de oferta

Criar regras configuráveis:

```text
MIN_DISCOUNT_PERCENT=20
MIN_PRICE=30
MIN_RATING=4.3
MIN_REVIEWS=10
ONLY_NEW=true
ONLY_FREE_SHIPPING=false
```

Criar `isValidOffer(product)`.

Cada rejeição deve possuir motivo.

Exemplo:

```javascript
{
  valid: false,
  reason: "discount_below_minimum"
}
```

Testes obrigatórios:

- um teste por regra de filtro;
- combinação de filtros;
- oferta válida aprovada;
- motivos de rejeição corretos.

---

## FASE 3 — Scanner

### [ ] TASK 06 — Scanner automático

Criar job que:

1. seleciona query;
2. busca produtos;
3. obtém detalhes;
4. obtém preço;
5. calcula desconto;
6. aplica filtros;
7. verifica duplicidade;
8. salva oferta válida;
9. registra log.

Queries iniciais:

```text
ssd nvme
memoria ram
monitor gamer
mouse gamer
teclado mecanico
headset
smartphone
smart tv
ferramentas
air fryer
```

Log esperado:

```text
[SCAN] query="ssd nvme" found=50 valid=7 inserted=4 duplicates=3
```

Testes obrigatórios:

- scanner executa sem crash;
- duplicata não é inserida;
- oferta inválida não é salva;
- oferta válida é salva;
- erro em um item não aborta toda varredura quando possível.

---

### [ ] TASK 07 — Agendamento com cron

Adicionar `node-cron`.

Configuração padrão:

```text
SCAN_CRON=*/30 * * * *
```

Adicionar lock para impedir varreduras simultâneas.

Criar:

```text
POST /api/scan
```

Testes obrigatórios:

- execução manual funciona;
- lock impede segunda execução simultânea;
- cron é registrado corretamente;
- falha do scanner não deixa lock preso.

---

## FASE 4 — Painel

### [ ] TASK 08 — Painel web inicial

Criar painel mobile-first em `/public`.

Identidade:

```text
#111111
#FFD100
#FF6A00
#FFFFFF
```

Cards devem mostrar:

- imagem;
- título;
- marketplace;
- preço anterior;
- preço atual;
- desconto;
- frete;
- avaliação;
- data;
- ações.

Filtros:

```text
Todas
Pendentes
Aprovadas
Rejeitadas
Postadas
```

Ordenações:

```text
Maior desconto
Mais recente
Menor preço
Maior preço
```

Testes obrigatórios:

- página abre sem erro;
- chamadas da API funcionam;
- cards renderizam;
- layout permanece utilizável em viewport mobile;
- console do navegador sem erros relevantes.

---

### [ ] TASK 09 — Aprovação de ofertas

Adicionar:

```text
PATCH /api/offers/:id/approve
PATCH /api/offers/:id/reject
PATCH /api/offers/:id/posted
```

Painel deve atualizar card sem reload completo.

Testes obrigatórios:

- cada endpoint altera somente o status esperado;
- ID inexistente tratado;
- painel reflete atualização;
- banco mantém estado após reinício.

---

### [ ] TASK 10 — Gerador de mensagem

Criar gerador da mensagem pronta para WhatsApp.

Modelo base:

```text
🔥 OFERTA ENCONTRADA!

{produto}

De: ~R$ {preco_antigo}~
🔥 Por: R$ {preco_atual}

💰 {desconto}% OFF
{frete}

🛒 Comprar:
{link}

⚠️ Preço e estoque podem mudar a qualquer momento.

🔥 Conecta Ofertas
Melhores ofertas, mais economia.
```

Criar:

```text
GET /api/offers/:id/message
```

Adicionar botão `COPIAR MENSAGEM`.

Testes obrigatórios:

- mensagem com desconto;
- mensagem sem preço anterior;
- mensagem com affiliate URL;
- fallback para permalink;
- clipboard no painel.

---

## FASE 5 — Afiliados e configuração

### [ ] TASK 11 — Affiliate Service

Criar serviço desacoplado:

```javascript
generateAffiliateUrl(productUrl, marketplace)
```

Não inventar API.

Fallback:

```javascript
{
  success: false,
  originalUrl: productUrl,
  affiliateUrl: null,
  requiresManualGeneration: true
}
```

Adicionar endpoint para salvar link manualmente:

```text
PATCH /api/offers/:id/affiliate-url
```

Testes obrigatórios:

- salvar URL afiliada;
- validar payload;
- mensagem passa a utilizar affiliate URL;
- fallback continua funcionando.

---

### [ ] TASK 12 — Configurações pelo painel

Criar tabela `settings`.

Permitir alterar:

- desconto mínimo;
- preço mínimo;
- rating mínimo;
- avaliações mínimas;
- apenas novo;
- apenas frete grátis;
- cron/intervalo permitido.

Não editar `.env` pelo navegador.

Testes obrigatórios:

- salvar configuração;
- recarregar configuração após restart;
- scanner utiliza configuração atualizada;
- payload inválido é rejeitado.

---

## FASE 6 — Qualidade das ofertas

### [ ] TASK 13 — Categorias internas

Categorias iniciais:

```text
Tecnologia
Games
Casa
Ferramentas
Celulares
Automotivo
Outros
```

Associar queries a categorias.

Adicionar filtro no painel.

---

### [ ] TASK 14 — Score de oferta

Criar `offer_score` simples.

Critérios iniciais:

```text
Desconto: até 10
Avaliação: até 3
Quantidade de avaliações: até 2
Frete grátis: +1
Preço promocional confirmado: +2
```

Não tornar excessivamente complexo.

Testes obrigatórios:

- score determinístico;
- limites respeitados;
- ordenação por score funciona.

---

### [ ] TASK 15 — Histórico de preços

Criar tabela `price_history`.

Campos:

```text
id
offer_id
price
regular_price
discount_percent
captured_at
```

Produto existente deve registrar nova leitura sem duplicar oferta.

Exibir futuramente:

```text
menor preço observado
maior preço observado
preço médio
```

Testes obrigatórios:

- múltiplas leituras do mesmo produto;
- oferta continua única;
- histórico cresce corretamente;
- agregações retornam valores esperados.

---

## FASE 7 — Segurança e operação

### [ ] TASK 16 — Segurança básica

Adicionar quando necessário:

- Helmet;
- rate limit;
- validação de payload;
- proteção por prepared statements;
- `ADMIN_TOKEN` para rotas de escrita.

Testes obrigatórios:

- rota protegida sem token;
- token inválido;
- token válido;
- rate limit básico;
- payload inválido.

---

### [ ] TASK 17 — Scripts para S10

Criar documentação/scripts:

```text
start-conecta
stop-conecta
restart-conecta
status-conecta
logs-conecta
```

Não alterar scripts dos outros serviços existentes no S10.

Testes obrigatórios quando executados no S10:

- start inicia processo;
- status detecta corretamente;
- logs mostra saída;
- restart reinicia;
- stop encerra somente o Conecta Ofertas.

---

### [ ] TASK 18 — Cloudflare Tunnel

Documentar publicação opcional em:

```text
ofertas.nathanmariotto.com.br
```

Aplicação permanece localmente em:

```text
localhost:3100
```

Não alterar DNS/tunnel automaticamente sem autorização.

---

## FASE 8 — Operação e manutenção

### [ ] TASK 19 — Dashboard de estatísticas

Adicionar indicadores:

```text
Ofertas encontradas hoje
Pendentes
Aprovadas
Postadas
Maior desconto atual
```

Sem bibliotecas pesadas de gráfico.

---

### [ ] TASK 20 — Limpeza automática

Regras iniciais:

- `pending` > 7 dias → `expired`;
- `rejected` > 30 dias → elegível para limpeza;
- histórico de preço preservado conforme regra definida;
- ofertas postadas preservadas.

Criar rotina diária.

---

### [ ] TASK 21 — Logs estruturados

Arquivos previstos:

```text
logs/app.log
logs/error.log
logs/scanner.log
```

Formato:

```text
2026-09-03 15:30:00 [SCAN] query="ssd nvme" found=50 valid=8 inserted=5
```

Nunca registrar segredos.

---

### [ ] TASK 22 — README final

Documentar:

- objetivo;
- arquitetura;
- instalação;
- configuração;
- `.env`;
- banco;
- scanner;
- painel;
- S10/Termux;
- Cloudflare;
- troubleshooting.

---

# IDEIAS FUTURAS — NÃO IMPLEMENTAR SEM NOVA TASK

- integração com Shopee;
- Amazon;
- outros marketplaces;
- publicação automática via integrações oficiais;
- analytics de clique/conversão;
- ranking inteligente de promoções;
- notificações;
- uso de IA para copy;
- aplicação móvel dedicada.

---

# HISTÓRICO DE EXECUÇÃO

Nenhuma task de desenvolvimento concluída ainda.

Última atualização desta memória: **2026-09-03**.
