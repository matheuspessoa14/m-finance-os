# M Finance.OS

Aplicação web/PWA de organização financeira pessoal desenvolvida com React, Vite, Firebase Authentication e Cloud Firestore.

O **M Finance.OS** foi idealizado e desenvolvido por **Matheus Pessoa Telles de Oliveira**, com foco em oferecer uma experiência simples, moderna e responsiva para organização financeira pessoal em desktop e dispositivos móveis.

> **Projeto autoral:** a identidade do produto, sua organização, fluxos, implementação e evolução do M Finance.OS fazem parte de um projeto pessoal desenvolvido e mantido por Matheus Pessoa Telles de Oliveira.

---

## Versão atual

**V1.2.4 — release final com refinamento mobile, máscara BRL e seletor responsivo**

---

## Recursos

- Login com Google;
- dados isolados por UID no Firestore;
- dashboard financeiro mensal;
- rendas, gastos, compras parceladas e valores guardados;
- criação, edição e exclusão de lançamentos;
- confirmação antes de exclusões;
- toasts de sucesso, erro e informação;
- histórico mensal;
- exportação CSV compatível com Excel;
- pagamentos de parcelas controlados por mês (`paidMonths`);
- onboarding para usuário novo;
- botões de onboarding com destaque visual;
- modal mobile centralizado e refinado;
- tela Minha conta;
- exclusão de conta e dos dados financeiros;
- página de privacidade;
- PWA instalável no celular;
- layout responsivo para desktop e mobile;
- indicador de conexão e sincronização;
- seletor de período responsivo sem dropdown nativo;
- bloqueio de gravações quando o aparelho está offline;
- formulário mantém os dados caso a gravação falhe;
- validação amigável de campos e valores;
- entrada monetária com máscara automática em reais;
- Error Boundary para evitar tela branca em erros inesperados;
- App Check preparado por variável de ambiente.

---

## Estrutura

```text
src/
├── components/   # UI, layout, modal, feedback e Error Boundary
├── config/       # marca e nomes das collections
├── hooks/        # Firestore, PWA e estado de conexão
├── pages/        # telas da aplicação
├── services/     # comunicação com Firestore/Auth
├── styles/       # estilos base + produto
├── utils/        # datas, cálculos, validação e CSV
├── App.jsx
├── firebase.js
└── main.jsx
```

---

## Rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Copie `.env.example` para `.env`.

3. Preencha as variáveis do aplicativo Web criado no Firebase.

4. Inicie:

```bash
npm run dev
```

---

## Variáveis de ambiente

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Opcional por enquanto
VITE_FIREBASE_APPCHECK_SITE_KEY=
```

O `.env` real é ignorado pelo Git e **não deve ser enviado ao GitHub**.

---

## Firebase / plano Spark

O projeto foi planejado para continuar utilizável no plano gratuito Spark, respeitando as cotas dos produtos Firebase utilizados.

### Firestore Rules

O arquivo `firestore.rules` contém validações para:

- usuário autenticado;
- acesso somente ao próprio UID;
- collections e campos esperados;
- valores monetários maiores que zero;
- limites de tamanho de texto;
- status e tipos permitidos;
- máximo de 120 parcelas.

Teste o aplicativo antes de publicar mudanças nas Rules.

### App Check

O código está preparado para App Check, mas ele só é inicializado quando:

```env
VITE_FIREBASE_APPCHECK_SITE_KEY=...
```

estiver configurado.

Não ative enforcement antes de o domínio de produção estar configurado e testado.

---

## PWA

A aplicação inclui:

- `manifest.webmanifest`;
- ícones 192px, 512px, maskable e Apple Touch Icon;
- Service Worker registrado apenas em produção;
- instalação pela tela Minha conta;
- experiência standalone após instalação.

---

## Build de produção

Antes de publicar:

```bash
npm run build
```

Depois teste a build:

```bash
npm run preview
```

---

## Vercel

O projeto possui `vercel.json` com fallback da SPA.

Na Vercel, cadastre as variáveis de ambiente do `.env` em:

**Project Settings → Environment Variables**

Depois do deploy, adicione o domínio gerado pela Vercel em:

**Firebase Authentication → Settings → Authorized domains**

---

## Checklist

Consulte `FINAL_CHECKLIST.md` antes do primeiro push/deploy.

---

## Privacidade

A página de privacidade incluída é uma base inicial de produto. Caso o M Finance.OS seja comercializado em maior escala, recomenda-se revisão jurídica e adequação completa à LGPD.

---

## Autoria

**M Finance.OS** é um projeto pessoal idealizado, desenvolvido e mantido por:

**Matheus Pessoa Telles de Oliveira**

O projeto foi criado como iniciativa própria para estudo, desenvolvimento profissional e evolução de uma solução de organização financeira pessoal, com possibilidade de futura disponibilização comercial.

---

## Direitos autorais e uso

**© 2026 Matheus Pessoa Telles de Oliveira. Todos os direitos reservados.**

O código-fonte original, a identidade visual, a marca **M Finance.OS**, a estrutura da aplicação e as implementações específicas deste projeto não podem ser copiadas, redistribuídas, revendidas, sublicenciadas ou utilizadas comercialmente por terceiros sem autorização prévia e expressa do autor.

A disponibilização deste repositório para consulta, demonstração, avaliação técnica ou portfólio **não concede automaticamente permissão para reutilização comercial do projeto**.

As bibliotecas, frameworks, serviços e demais dependências de terceiros utilizadas pelo M Finance.OS permanecem sujeitas às respectivas licenças e termos de seus próprios autores e fornecedores.

Para solicitações relacionadas a uso, parceria, licenciamento ou comercialização do projeto, entre em contato diretamente com o autor.

---

## Tecnologias principais

- React
- Vite
- Firebase Authentication
- Cloud Firestore
- Firebase App Check
- PWA / Service Worker
- Recharts
- Lucide React
- Vercel
