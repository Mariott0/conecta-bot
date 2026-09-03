---
name: conecta-ofertas
description: Contexto técnico e padrões de desenvolvimento do projeto Conecta Ofertas.
---

# SKILL — Conecta Ofertas

## Regra de uso

Antes de qualquer implementação, o agente deve ler:

1. `AGENTS.md`
2. `SKILL.md`
3. `memory.md`

Este arquivo define o contexto técnico e os padrões de implementação. As tarefas ativas ficam exclusivamente em `memory.md`.

## Contexto do produto

O **Conecta Ofertas** é uma aplicação leve de curadoria de promoções para programas de afiliados.

Fluxo principal:

```text
Marketplace
→ Buscar produtos
→ Consultar preço
→ Identificar promoções
→ Aplicar filtros
→ Salvar no banco
→ Mostrar no painel
→ Aprovação manual
→ Gerar mensagem
→ Postagem manual
```

A aplicação NÃO deve ser tratada inicialmente como robô de disparo de WhatsApp.

## Ambiente alvo

```text
Samsung Galaxy S10
Termux
Ubuntu
ARM64
Node.js
```

O sistema precisa consumir poucos recursos e coexistir com outros serviços no aparelho.

## Stack padrão

```text
Node.js
Express
SQLite
Axios
node-cron
dotenv
HTML
CSS
JavaScript
```

Adicionar novas dependências apenas quando houver necessidade técnica clara.

## Arquitetura preferencial

```text
src/
├── app.js
├── config/
├── database/
├── jobs/
├── routes/
├── services/
└── utils/

public/
data/
logs/
```

Separar responsabilidades entre módulos.

## Princípios técnicos

### Leve

Evitar:

- frameworks frontend pesados;
- bancos externos sem necessidade;
- serviços redundantes;
- processos em background desnecessários;
- dependências com baixa compatibilidade ARM64.

### Modular

Separar lógica de:

- marketplace;
- preços;
- filtros;
- persistência;
- afiliados;
- jobs;
- geração de mensagem;
- painel.

### Seguro

Nunca expor:

```text
tokens
senhas
cookies
credenciais
chaves privadas
```

### Resiliente

Integrações externas devem considerar:

```text
timeout
rate limit
retry
HTTP 401
HTTP 403
HTTP 429
HTTP 5xx
```

Retry deve ocorrer somente em falhas temporárias.

## Mercado Livre

Preferir sempre API oficial e documentação atual.

Não:

- inventar endpoints;
- assumir documentação antiga como válida;
- fazer scraping quando uma API oficial resolver o problema;
- colocar token diretamente no código.

Interfaces sugeridas:

```javascript
searchProducts(query, options)
getItemDetails(itemId)
getItemsBulk(itemIds)
```

## Normalização de preço

Estrutura interna sugerida:

```javascript
{
  currentPrice,
  regularPrice,
  discountPercent,
  promotionId,
  promotionType
}
```

Cálculo padrão:

```javascript
discountPercent =
  regularPrice > currentPrice
    ? ((regularPrice - currentPrice) / regularPrice) * 100
    : 0;
```

## Modelo interno de oferta

```javascript
{
  marketplace,
  externalId,
  title,
  category,
  currentPrice,
  originalPrice,
  discountPercent,
  permalink,
  affiliateUrl,
  thumbnail,
  freeShipping,
  condition,
  sellerId,
  sellerReputation,
  reviewsAverage,
  reviewsCount,
  status,
  createdAt,
  updatedAt
}
```

## Status de oferta

```text
pending
approved
rejected
posted
expired
```

Não criar novos status sem necessidade.

## Filtros

Filtros devem ser configuráveis.

Exemplos:

```text
MIN_DISCOUNT_PERCENT
MIN_PRICE
MIN_RATING
MIN_REVIEWS
ONLY_NEW
ONLY_FREE_SHIPPING
```

Uma oferta rejeitada deve possuir motivo identificável.

Exemplo:

```javascript
{
  valid: false,
  reason: "discount_below_minimum"
}
```

## Duplicação

Chave lógica:

```text
marketplace + external_id
```

Se um produto já existir:

- não criar duplicata;
- atualizar dados relevantes;
- registrar histórico de preço quando aplicável.

## Histórico de preços

Estrutura mínima:

```text
offer_id
price
regular_price
discount_percent
captured_at
```

Deve permitir no futuro calcular:

```text
menor preço observado
maior preço observado
preço médio
```

## Affiliate Service

Toda lógica de afiliados deve ficar isolada.

Interface sugerida:

```javascript
generateAffiliateUrl(productUrl, marketplace)
```

Nunca inventar integração.

Fallback:

```javascript
{
  success: false,
  originalUrl: productUrl,
  affiliateUrl: null,
  requiresManualGeneration: true
}
```

## Scanner

Fluxo esperado:

1. selecionar query;
2. buscar produtos;
3. coletar detalhes;
4. consultar preços;
5. calcular desconto;
6. aplicar filtros;
7. verificar duplicidade;
8. salvar ou atualizar;
9. registrar histórico;
10. gerar log resumido.

Exemplo:

```text
[SCAN] query="ssd nvme" found=50 valid=7 inserted=4 duplicates=3
```

## Cron

Nunca permitir duas varreduras simultâneas.

Exemplo:

```javascript
let isScanRunning = false;
```

Se já houver execução:

```text
SCAN SKIPPED - previous execution still running
```

## SQLite

Regras:

- prepared statements;
- migrations controladas;
- índices necessários;
- não apagar banco automaticamente;
- não concatenar entrada externa em SQL.

## Painel

Mobile-first.

Cards devem priorizar:

```text
imagem
título
preço antigo
preço atual
desconto
frete
avaliação
data
ações
```

Ações previstas:

```text
Aprovar
Rejeitar
Marcar como postada
Abrir produto
Copiar mensagem
Adicionar link afiliado
```

Identidade visual:

```text
Marca: Conecta Ofertas
Preto: #111111
Amarelo: #FFD100
Laranja: #FF6A00
Branco: #FFFFFF
```

## Mensagem de oferta

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

Se `affiliate_url` existir, utilizar primeiro. Caso contrário, utilizar `permalink`.

## Termux / S10

Scripts futuros podem incluir:

```text
start-conecta
stop-conecta
restart-conecta
status-conecta
logs-conecta
```

Esses scripts não podem alterar serviços de outros projetos existentes no aparelho.

## Cloudflare

Aplicação local sugerida:

```text
localhost:3100
```

Hostname sugerido:

```text
ofertas.nathanmariotto.com.br
```

Não alterar DNS ou tunnel sem task explícita.

## Validação obrigatória

Uma implementação só pode ser considerada concluída depois de testes.

Dependendo da mudança, validar:

- sintaxe;
- imports;
- paths;
- `package.json`;
- variáveis de ambiente;
- SQL/migrations;
- inicialização do servidor;
- endpoint alterado;
- fluxo do painel;
- logs;
- regressões;
- testes automatizados existentes.

Se houver falha, corrigir e repetir os testes.

## Escopo

As tasks ficam em `memory.md`.

Nunca implementar antecipadamente:

- Shopee;
- Amazon;
- WhatsApp automático;
- IA;
- notificações;
- autenticação complexa;
- Docker;
- recursos futuros;

salvo quando houver task explícita em `memory.md` ou solicitação direta do usuário.
