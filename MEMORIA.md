# Memoria do Projeto ARMeCardapios

Ultima atualizacao: 2026-06-11

## Objetivo

Criar um modelo simples e rapido para restaurante, inicialmente focado em cardapio digital diario, com possibilidade de venda antecipada de jantares.

A decisao atual nao e construir um SaaS multicliente completo. O projeto funciona como modelo para um cliente por vez, facil de adaptar para outros restaurantes.

## Publicacao

Repositorio GitHub:

- `https://github.com/AndersonMoro/armrestaurante`
- branch principal: `main`

Hospedagem escolhida:

- Vercel para publicar o app React/Vite.
- Hostinger ficou apenas como dominio/DNS.

Dominio:

- `https://armecardapios-centerhotel.site`

Foi criado `vercel.json` com rewrite para SPA, permitindo acesso direto a rotas como:

- `/admin`
- `/auth`
- `/cardapio`
- `/jantares`

## Supabase

Projeto atual:

- Project ID: `dbyjedgvzailaljnwhwa`
- URL base: `https://dbyjedgvzailaljnwhwa.supabase.co`

Arquivo `.env` local contem:

- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Nao registrar chaves completas neste arquivo.

### Autenticacao

Fluxo atual:

- `/auth`: tela de login do admin.
- `/reset-password`: tela para redefinir senha apos abrir o link enviado pelo Supabase.

Foi implementado reset de senha com:

- `supabase.auth.resetPasswordForEmail`
- redirecionamento para `/reset-password`
- `supabase.auth.updateUser({ password })` na tela de nova senha
- `detectSessionInUrl: true` no cliente Supabase

No Supabase, manter Redirect URLs para:

- `https://armecardapios-centerhotel.site/**`
- `https://armecardapios-centerhotel.site/reset-password`
- `http://localhost:5173/reset-password`
- `http://127.0.0.1:5173/reset-password`

Remover URLs quebradas como `https://https://...`.

Cadastro publico:

- A tela de login nao mostra mais opcao de criar conta.
- O app nao expõe mais fluxo visual de `signUp`.
- Tambem desativar no Supabase a opcao de novos cadastros por email depois de criar o usuario admin definitivo.

## Rotas principais

- `/`: home com logo, cardapio do dia e compra antecipada.
- `/cardapio`: consulta de cardápios por data.
- `/cardapio/:id/imprimir`: versao imprimivel.
- `/jantares`: compra antecipada de jantares.
- `/auth`: login.
- `/admin`: painel administrativo protegido por Supabase Auth.

## Identidade visual

Arquivos locais de marca:

- `LOGO.png`
- `LOGO_BRANCA.png`
- `Gemini_Generated_Image_.png`

A logo branca e usada no hero. A logo padrao e usada em outros pontos. Se `logo_url` for configurada no admin, ela pode ter prioridade em componentes que usam configuracao.

Tela de login/admin:

- Atualizada para identidade ARM Cardapios.
- Titulo visual: `ARM Cardápios Admin`.
- Subtitulo: `Acesse o painel administrativo`.
- Tipografia: Sora via Google Fonts, com fallback system UI.
- Cores principais: navy `#0B1325`, azul `#0057FF`, fundo `#F2F4F7`.
- Card centralizado, branco, bordas arredondadas, sombra suave.
- Logo ARM no topo, com icone customizado SVG de cardapio/livro aberto.
- Campos com icones discretos de email, cadeado e olho.
- Footer da tela de login usa a marca `ARM Cardápios`.

Assets publicos adicionados/atualizados:

- `public/arm-logo-transparent.png`
- `public/arm-cardapios-footer-logo.png`
- `public/favicon.ico`
- `public/favicon-16x16.png`
- `public/favicon-32x32.png`
- `public/favicon-48x48.png`
- `public/apple-touch-icon.png`
- `public/icon-192x192.png`
- `public/icon-512x512.png`
- `public/site.webmanifest`

Observacao:

- Nao alterar `ARMeCardapios` em nomes tecnicos nem o dominio `armecardapios-centerhotel.site`.
- Textos visuais devem usar `Cardápios` com acento.

Hero atual:

- Mais compacto.
- Usa logo central.
- Frase: `Restaurante com sabor de tradicao.`
- Botao "Cardapio do dia" removido do hero.
- Compra antecipada aparece como faixa/CTA separada.

## Cardapio diario

O admin permite criar cardápios por data com:

- titulo
- data
- PDF/anexo opcional
- observacoes
- preco por kg e buffet livre
- categorias
- pratos/itens
- disponibilidade

Como o restaurante trabalha com buffet por kg/livre, nao e necessario preco por item.

Melhorias ja feitas para cadastro diario:

- duplicar ultimo cardapio
- modelo de buffet com categorias prontas
- colar varios itens por linha
- impressao bonita
- historico por data

## Configuracoes e contato

Contato foi corrigido para montar link WhatsApp corretamente.

Funcao utilitaria:

- `buildWhatsAppUrl`
- `normalizeBrazilianWhatsAppNumber`

O app remove caracteres do numero, adiciona `55` quando for numero brasileiro com DDD e monta `https://wa.me/...`.

Importante: o numero precisa existir no WhatsApp. Telefone fixo sem WhatsApp nao funciona.

## Compra antecipada de jantares

Tabelas principais:

- `dinner_events`
- `dinner_orders`

`dinner_events` guarda:

- data do jantar
- titulo
- descricao
- resumo do cardapio
- valor no dia
- valor antecipado
- quantidade total disponivel
- quantidade reservada
- horario limite de compra
- ativo/inativo

`dinner_orders` guarda:

- comprador
- WhatsApp
- email opcional
- quantidade
- valor unitario do momento da compra
- status
- voucher
- dados Pagar.me

Status possiveis:

- `pending`
- `paid`
- `cancelled`
- `used`
- `expired`

Regra:

- Ao criar uma reserva/compra, a vaga e ocupada enquanto o status estiver `pending` ou `paid`.
- Se o pagamento falhar ou cancelar, o webhook libera a vaga.
- A contagem foi reforcada com a migration `20260608143000_recalculate_dinner_reserved_quantity.sql`, que recalcula `reserved_quantity` pelos pedidos `pending` e `paid`.

## Pagar.me / Stone

Edge Function:

- `supabase/functions/create-pagarme-payment/index.ts`

Ela:

- recebe o `orderId`
- busca o pedido no Supabase
- cria link de pagamento no Pagar.me
- grava URL e resposta bruta em `dinner_orders`
- deixa pedido como `pending`

Meios de pagamento atuais:

- somente `credit_card`

Pix foi removido temporariamente porque a conta Pagar.me/Stone ainda nao tem Pix habilitado para esse fluxo.

Webhook:

- `supabase/functions/pagarme-webhook/index.ts`

Eventos esperados:

- `order.paid`
- `charge.paid`
- `order.payment_failed`
- `order.canceled`
- `charge.payment_failed`
- `checkout.canceled`

Quando pagamento aprova:

- pedido vira `paid`
- `paid_at` e preenchido
- dados do webhook ficam registrados

Quando falha/cancela:

- pedido vira `expired` ou `cancelled`
- vaga e liberada

Publicacao das functions:

```powershell
supabase functions deploy create-pagarme-payment --project-ref dbyjedgvzailaljnwhwa
supabase functions deploy pagarme-webhook --project-ref dbyjedgvzailaljnwhwa --no-verify-jwt
```

Secrets importantes:

- `PAGARME_SECRET_KEY`
- `PAGARME_API_BASE` opcional
- `PAGARME_WEBHOOK_SECRET` opcional

Para producao, a API base padrao e:

- `https://api.pagar.me/core/v5`

Observacao de teste:

- Um link Pagar.me de producao abriu tela de bloqueio Cloudflare `Sorry, you have been blocked`.
- Isso ocorreu no checkout Pagar.me, nao no app.
- Se persistir, acionar suporte Pagar.me/Stone com print, link e Cloudflare Ray ID.

## WhatsApp / Twilio

Objetivo:

- notificar automaticamente o restaurante quando existir compra antecipada.

Implementado:

- aviso na criacao do link de pagamento
- aviso quando webhook Pagar.me confirma pagamento aprovado

Edge Functions que enviam Twilio:

- `create-pagarme-payment`
- `pagarme-webhook`

Secrets necessarios:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `RESTAURANT_WHATSAPP_TO`

Exemplo Sandbox:

```powershell
supabase secrets set TWILIO_WHATSAPP_FROM="whatsapp:+14155238886" --project-ref dbyjedgvzailaljnwhwa
supabase secrets set RESTAURANT_WHATSAPP_TO="whatsapp:+5549999220942" --project-ref dbyjedgvzailaljnwhwa
```

O numero `+5549999220942` foi usado como numero pessoal de teste do Anderson, nao como numero definitivo do restaurante.

Para o Sandbox funcionar:

- O numero que recebe precisa enviar o codigo `join ...` para o numero da Twilio.
- Enquanto estiver em teste, todas as compras podem avisar apenas o WhatsApp pessoal.

Resultado confirmado:

- Aviso de nova compra antecipada chegou no WhatsApp com cliente, quantidade, valor, voucher e link de pagamento.

Para producao:

- Solicitar aprovacao de WhatsApp Sender na Twilio.
- Caminho: Twilio Console > Messaging > Senders > WhatsApp Senders.
- Depois trocar `TWILIO_WHATSAPP_FROM` para o numero oficial aprovado.
- A aprovacao pode levar horas ou dias.

## Migrations aplicadas

Migrations importantes:

- `20260529113000_restaurant_menu_schema.sql`
- `20260530141000_add_event_quotes.sql`
- `20260603100000_add_dinner_events.sql`
- `20260603113000_add_dinner_orders.sql`
- `20260603123000_add_pagarme_fields_to_dinner_orders.sql`
- `20260604100000_add_pagarme_webhook_events.sql`
- `20260608143000_recalculate_dinner_reserved_quantity.sql`

Ultima migration aplicada com:

```powershell
supabase db push --linked
```

O projeto local esta vinculado ao Supabase:

- `.temp/project-ref = dbyjedgvzailaljnwhwa`

## Validacoes recentes

Comandos executados:

```powershell
npm run build
npm run lint
```

Resultado:

- Build passou.
- Lint passou sem erros.
- Persistem 8 warnings antigos de Fast Refresh em componentes shadcn/contexto.

Ultimos commits/pushes importantes:

- `866e72c Add password reset flow`
- `8163676 Disable public account creation`
- `7550279 Update ARM login branding`

Warnings conhecidos:

- bundle acima de 500 kB
- Browserslist/caniuse-lite desatualizado
- warnings Fast Refresh

## Pendencias e proximos cuidados

1. Testar nova compra depois da migration de vagas e confirmar que 5 vira 4.
2. Testar webhook Pagar.me apos pagamento aprovado.
3. Confirmar se o segundo WhatsApp chega quando pedido vira `paid`.
4. Configurar WhatsApp Sender de producao na Twilio quando sair do Sandbox.
5. Criar painel no admin para listar compras/reservas de jantares.
6. Criar acao admin para marcar voucher como usado.
7. Criar QR Code ou pagina de validacao do voucher.
8. Revisar textos com acentuacao quebrada em algumas telas antigas.
9. Desativar cadastro publico no Supabase apos criar usuario definitivo do admin.
10. Considerar otimizacao de bundle/code splitting.
