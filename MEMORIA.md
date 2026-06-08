# Memoria do Projeto ARMeCardapios

Ultima atualizacao: 2026-05-29

## Objetivo

Criar um modelo simples e rapido para restaurante, inicialmente focado em cardapio digital.

A ideia atual nao e construir um SaaS multicliente completo. O caminho escolhido foi criar uma aplicacao modelo para um cliente por vez, facil de adaptar para outros restaurantes depois.

## Direcao do produto

O sistema deve permitir:

- Criar cardapios por data.
- Cadastrar categorias e pratos em formulario.
- Informar nome, descricao, preco opcional e disponibilidade dos pratos.
- Exibir o cardapio em HTML bonito e responsivo.
- Gerar uma versao imprimivel automaticamente.
- Anexar PDF pronto quando o cliente ja tiver um cardapio feito.
- Usar historico de cardapios por data.
- Salvar PDFs, imagens e arquivos historicos no Supabase Storage.

Possiveis fases futuras:

- Upload de imagens por prato.
- Exportacao/geracao de PDF a partir do cardapio estruturado.
- Reservas e vendas antecipadas por data.
- Integracao Pagar.me/Stone para jantares, promocoes e eventos pagos.

## Decisoes tomadas

### 1. Nao iniciar como SaaS

Foi decidido nao criar multi-tenant agora. A aplicacao sera um modelo simples para um cliente unico. Se novos clientes aparecerem, a base pode ser copiada/adaptada ou evoluida para multi-tenant depois.

### 2. Supabase voltou a ser usado

Houve uma etapa em que o Supabase foi removido e os dados passaram para `localStorage`, porque nao havia acesso ao admin nem projeto Supabase configurado.

Depois, foi decidido recriar o Supabase do zero com schema correto para:

- Configuracoes do restaurante.
- Cardapios por data.
- Categorias do cardapio.
- Itens/pratos.
- Anexos e arquivos historicos.
- Storage para PDFs e imagens.

### 3. Admin protegido por login

O admin voltou a ser protegido por Supabase Auth.

Rota:

- `/auth`: login/cadastro.
- `/admin`: painel protegido.

Observacao: no momento, qualquer usuario autenticado consegue administrar. Para cliente unico, o recomendado e criar manualmente o usuario do cliente no Supabase e depois desativar cadastro publico.

## Supabase

Projeto atual:

- Project ID: `dbyjedgvzailaljnwhwa`
- URL base configurada: `https://dbyjedgvzailaljnwhwa.supabase.co`

Arquivo `.env` atualizado com:

- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Por seguranca, nao copiar a chave completa neste arquivo de memoria. Consultar o `.env` local quando necessario.

## Migration criada

Arquivo:

`supabase/migrations/20260529113000_restaurant_menu_schema.sql`

Ela cria:

- `restaurants`
- `site_settings`
- `menus`
- `menu_categories`
- `menu_items`
- `menu_assets`
- bucket publico `restaurant-assets`
- politicas RLS com leitura publica e escrita para usuarios autenticados

Tambem cria um restaurante inicial com:

- `slug = principal`
- nome padrao `Restaurante`

## Estrutura atual dos dados

### restaurants

Guarda identidade do restaurante:

- nome
- slug
- logo
- cor primaria
- cor secundaria

### site_settings

Guarda configuracoes do site:

- titulo/subtitulo do hero
- texto sobre
- imagem sobre
- texto da cozinha
- estatisticas
- modulos da home
- contato

### menus

Guarda cada cardapio por data:

- data
- titulo
- observacoes
- link de PDF/anexo
- ativo/inativo

### menu_categories

Categorias dentro de um cardapio:

- Entradas
- Pratos principais
- Sobremesas
- Bebidas
- etc.

### menu_items

Pratos/itens dentro das categorias:

- nome
- descricao
- preco opcional
- imagem opcional
- disponibilidade
- ordem

### menu_assets

Arquivos extras/historicos ligados ao cardapio.

### dinner_events

Guarda jantares vendidos antecipadamente:

- data do jantar
- titulo
- descricao comercial
- resumo do cardapio
- valor normal
- valor antecipado com desconto
- quantidade total disponivel
- quantidade reservada
- horario limite de compra, padrao 17:00
- ativo/inativo

### dinner_orders

Guarda reservas/compras de jantares:

- jantar relacionado
- nome do comprador
- WhatsApp
- e-mail opcional
- quantidade de pessoas
- valor unitario copiado do jantar no momento da reserva
- status: pending, paid, cancelled, used, expired
- codigo de voucher
- observacoes
- link de pagamento Pagar.me
- id do link de pagamento Pagar.me
- resposta bruta do Pagar.me para auditoria

A criacao publica usa a funcao SQL `create_dinner_order`, que valida estoque, data e horario limite usando fuso `America/Sao_Paulo`.

## Arquivos importantes alterados/criados

### Supabase e auth

- `src/integrations/supabase/client.ts`
- `src/hooks/useAuth.ts`
- `src/components/ProtectedRoute.tsx`
- `src/pages/Auth.tsx`

### Cardapios

- `src/hooks/useMenus.ts`
- `src/pages/Cardapio.tsx`
- `src/pages/CardapioPrint.tsx`
- `src/pages/Admin.tsx`
- `src/types/index.ts`

### Orcamentos de evento

- `src/hooks/useEventQuotes.ts`
- `supabase/migrations/20260530141000_add_event_quotes.sql`

### Jantares antecipados

- `src/hooks/useDinnerEvents.ts`
- `src/hooks/useDinnerOrders.ts`
- `supabase/migrations/20260603100000_add_dinner_events.sql`
- `supabase/migrations/20260603113000_add_dinner_orders.sql`
- `supabase/migrations/20260603123000_add_pagarme_fields_to_dinner_orders.sql`
- `supabase/functions/create-pagarme-payment/index.ts`
- `src/pages/Jantares.tsx`

### Configuracoes

- `src/hooks/useSiteConfigDB.ts`
- `src/context/SiteConfigContext.tsx`

### Rotas

- `src/App.tsx`

Rotas relevantes:

- `/`
- `/cardapio`
- `/cardapio/:id/imprimir`
- `/auth`
- `/admin`

## Funcionalidades implementadas

### Identidade visual

- A logo local `LOGO.png` passou a ser usada como logo padrao no cabecalho e rodape.
- Se uma `logo_url` for configurada no admin, ela tem prioridade sobre a logo local.

### Cardapio estruturado

O admin consegue criar cardapio com:

- data
- titulo
- PDF/anexo opcional
- observacoes
- categorias
- pratos
- descricao
- preco
- disponibilidade

Como o restaurante trabalha com valor por kg e/ou buffet livre, o admin foi simplificado para nao exigir preco em cada prato.

Melhorias para lancamento diario:

- botao para aplicar um modelo de buffet com categorias prontas
- botao para duplicar o ultimo cardapio ativo
- campo para colar varios pratos de uma vez, um por linha, dentro de cada categoria
- campo de preco removido da edicao individual dos pratos

### Exibicao publica

A pagina `/cardapio`:

- abre o cardapio de hoje usando o fuso do Brasil (`America/Sao_Paulo`)
- separa a consulta em abas: hoje e consultar data
- mostra o cardapio estruturado quando existir
- mostra mensagens leves/divertidas quando nao existir cardapio para a data consultada
- permite abrir/baixar PDF se houver
- permite imprimir a versao estruturada

A home nao usa mais o ultimo cardapio ativo como substituto do dia atual. Se nao houver cardapio cadastrado para hoje, mostra uma mensagem informando que o cardapio ainda nao foi publicado.

### Impressao

Criada rota:

`/cardapio/:id/imprimir`

Essa pagina tem layout limpo para impressao.

### Upload

No admin, o campo de PDF agora permite:

- informar URL manualmente
- enviar arquivo PDF/imagem para Supabase Storage

O upload usa o bucket:

`restaurant-assets`

### Orcamentos para eventos

Foi adicionada uma aba `Orcamentos` no admin.

Ela permite criar propostas para clientes/eventos com:

- nome do cliente
- contato
- data do evento
- tipo de evento
- numero de pessoas
- observacoes gerais
- status da proposta
- 3 opcoes de cardapio com texto, valor e observacoes

Esses dados ficam na tabela `event_quotes`, separada dos cardapios diarios.

### Jantares antecipados

Foi iniciada a Fase 1 da venda antecipada de jantares.

Foi adicionada uma aba `Jantares` no admin para cadastrar:

- data do jantar
- titulo
- descricao
- resumo do cardapio
- valor no dia
- valor antecipado com desconto
- quantidade disponivel
- quantidade ja reservada
- horario limite para compra no mesmo dia
- status ativo/inativo

Esses dados ficam na tabela `dinner_events`.

Ainda nao foi implementada a integracao Pagar.me, voucher, webhook ou WhatsApp. A quantidade reservada e manual nesta fase.

Fase 2 iniciada:

- criada a pagina publica `/jantares`
- criado link `Jantares` no cabecalho
- cliente pode selecionar um jantar ativo/futuro
- cliente informa nome, WhatsApp, e-mail opcional e quantidade de pessoas
- o sistema cria uma reserva pendente via RPC `create_dinner_order`
- a RPC valida se o jantar esta ativo, se ainda esta dentro do horario limite e se ha estoque
- a RPC incrementa `reserved_quantity` de forma atomica
- e gerado um codigo de voucher pendente

Observacao: nesta fase, o voucher e pendente. A liberacao real apos pagamento entra na Fase 3 com Pagar.me/webhook.

Fase 3 iniciada:

- criada a Edge Function `create-pagarme-payment`
- a funcao usa `PAGARME_SECRET_KEY` somente no backend
- a funcao cria um Link de Pagamento/Checkout Pagar.me
- meios aceitos enviados para o Checkout: `credit_card` e `pix`
- a reserva continua com status `pending`
- o voucher continua pendente ate uma futura confirmacao por webhook
- o frontend chama a Edge Function depois de criar a reserva e mostra o botao `Ir para pagamento`
- foram adicionados campos Pagar.me em `dinner_orders`
- Fase 4 iniciada com Edge Function `pagarme-webhook`
- webhook marca pedido como `paid` em `order.paid`, `charge.paid` ou `checkout.closed`
- webhook cancela/expira pedido e libera vaga em falha/cancelamento
- eventos recebidos ficam registrados em `pagarme_webhook_events`
- `pagarme-webhook` precisa ser publicado com `--no-verify-jwt`
- Pix foi removido temporariamente do Checkout Pagar.me porque a conta ainda nao tem Pix habilitado
- `create-pagarme-payment` aceita por enquanto somente `credit_card`

Secrets/env necessarios no Supabase:

- `PAGARME_SECRET_KEY`
- opcional `PAGARME_API_BASE`
- opcional `PAGARME_WEBHOOK_SECRET`

Para ambiente de teste do Pagar.me, usar `PAGARME_API_BASE=https://sdx-api.pagar.me/core/v5`.
Para producao, a funcao usa por padrao `https://api.pagar.me/core/v5`.

## Validacoes realizadas

Comandos executados:

```bash
npm.cmd run build
npm.cmd run lint
```

Resultado:

- Build passou.
- Lint passou sem erros.
- Ainda existem avisos antigos de Fast Refresh em componentes shadcn e contexto.

Avisos conhecidos:

- Bundle acima de 500 kB.
- Browserslist/caniuse-lite desatualizado.
- `npm audit` indica vulnerabilidades em dependencias.

## Pendencias importantes

1. Aplicar a migration no SQL Editor do Supabase.
2. Criar usuario administrador em Supabase Auth.
3. Testar login em `/auth`.
4. Testar salvar configuracoes em `/admin`.
5. Testar criar cardapio estruturado.
6. Testar upload de PDF/imagem.
7. Testar exibicao em `/cardapio`.
8. Testar impressao em `/cardapio/:id/imprimir`.
9. Aplicar a migration `20260603100000_add_dinner_events.sql` no SQL Editor do Supabase.
10. Aplicar a migration `20260603113000_add_dinner_orders.sql` no SQL Editor do Supabase.
11. Aplicar a migration `20260603123000_add_pagarme_fields_to_dinner_orders.sql` no SQL Editor do Supabase.
12. Publicar a Edge Function `create-pagarme-payment` no Supabase.
13. Configurar `PAGARME_SECRET_KEY` nos secrets da Edge Function.
14. Aplicar a migration `20260604100000_add_pagarme_webhook_events.sql`.
15. Publicar a Edge Function `pagarme-webhook` com `--no-verify-jwt`.
16. Configurar no painel Pagar.me o webhook apontando para `/functions/v1/pagarme-webhook`.
17. Desativar cadastro publico no Supabase apos criar o usuario do cliente.

## Proximos passos recomendados

### Curto prazo

- Corrigir textos com encoding quebrado, como `CardÃ¡pio`, `ConfiguraÃ§Ãµes`, etc.
- Melhorar mensagens do admin.
- Separar `Admin.tsx` em componentes menores.
- Criar preview do cardapio dentro do admin.
- Criar painel administrativo de reservas/compras de jantares.
- Testar webhook Pagar.me/Stone para confirmar pagamento e liberar voucher.

### Medio prazo

- Upload de imagem por prato.
- Historico visual de cardapios anteriores.
- Botao para duplicar cardapio de uma data para outra.
- Filtro por data no admin.
- Exportar cardapio estruturado para PDF.

### Futuro

- Reservas por data.
- Vendas antecipadas de jantares/promocoes.
- Integracao Pagar.me/Stone.
- Controle de vagas/estoque.
- Lista de compradores/reservas no admin.
- Voucher com codigo unico/QR Code.
- Webhook para confirmar pagamento e baixar estoque automaticamente.
- Alerta de compra por WhatsApp.
