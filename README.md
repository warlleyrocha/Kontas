<h1 align="center">Kontas</h1>

<p align="center">
  <img src="https://img.shields.io/static/v1?label=React%20Native&message=0.81.5&color=61DAFB&style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/static/v1?label=Expo&message=SDK%2054&color=000020&style=for-the-badge&logo=expo"/>
  <img src="https://img.shields.io/static/v1?label=TypeScript&message=5.9&color=3178C6&style=for-the-badge&logo=typescript"/>
  <img src="https://img.shields.io/static/v1?label=Expo%20Router&message=6.0&color=000020&style=for-the-badge&logo=expo"/>
  <img src="https://img.shields.io/static/v1?label=React%20Query&message=5.90&color=FF4154&style=for-the-badge&logo=reactquery"/>
  <img src="https://img.shields.io/static/v1?label=NativeWind&message=4&color=38BDF8&style=for-the-badge&logo=tailwindcss"/>
  <img src="https://img.shields.io/static/v1?label=Sentry&message=7.2&color=362D59&style=for-the-badge&logo=sentry"/>
  <img src="https://img.shields.io/static/v1?label=SonarQube&message=10&color=4E9BCD&style=for-the-badge&logo=sonarqube"/>
</p>

### Tópicos

:small_blue_diamond: [Descrição do projeto](#descrição-do-projeto)

:small_blue_diamond: [Funcionalidades](#funcionalidades)

:small_blue_diamond: [Arquitetura](#arquitetura)

:small_blue_diamond: [Navegação](#navegação)

:small_blue_diamond: [Pré-requisitos](#pré-requisitos)

:small_blue_diamond: [Como rodar a aplicação](#como-rodar-a-aplicação-arrow_forward)

:small_blue_diamond: [Build e distribuição](#build-e-distribuição)

:small_blue_diamond: [Integração com API](#integração-com-api)

:small_blue_diamond: [Qualidade e observabilidade](#qualidade-e-observabilidade)

:small_blue_diamond: [Pontos de atenção](#pontos-de-atenção)

:small_blue_diamond: [Tecnologias utilizadas](#tecnologias-utilizadas-books)

:small_blue_diamond: [Desenvolvedor](#desenvolvedor-octocat)

---

## Descrição do projeto

<p align="justify">
  Kontas é um aplicativo mobile para gestão financeira colaborativa em repúblicas e moradias compartilhadas. Ele permite que moradores organizem contas coletivas, acompanhem pagamentos individuais e gerenciem quem divide cada despesa — tudo em um único lugar.
</p>

<p align="justify">
  O app oferece um painel por república com abas de resumo financeiro, contas e moradores. O administrador da república pode confirmar pagamentos, enviar convites por e-mail e acompanhar convites enviados. Os moradores acompanham suas obrigações, marcam pagamentos como realizados e consultam os dados de contato e a chave Pix dos demais moradores na aba de moradores.
</p>

---

## Funcionalidades

### Autenticação e sessão

:heavy_check_mark: Login com Google (OAuth)

:heavy_check_mark: Persistência segura de sessão (Expo SecureStore)

:heavy_check_mark: Validação automática de sessão ao iniciar o app

:heavy_check_mark: Logout com limpeza local e encerramento da sessão no Google Sign-In

### Perfil e onboarding

:heavy_check_mark: Fluxo de onboarding com introdução ao app

:heavy_check_mark: Controle de perfil incompleto com redirecionamento

:heavy_check_mark: Atualização de dados (nome, telefone, chave Pix)

:heavy_check_mark: Seleção de foto de perfil pela galeria

:heavy_check_mark: Acesso a Termos de Uso e Política de Privacidade

### Gestão de Repúblicas

:heavy_check_mark: Criação, edição e exclusão de repúblicas

:heavy_check_mark: Listagem de repúblicas do usuário

:heavy_check_mark: Estrutura em abas: Contas • Moradores • Resumo

### Sistema de Convites

:heavy_check_mark: Envio de convites por e-mail

:heavy_check_mark: Caixa de entrada de convites

:heavy_check_mark: Visualização de convites enviados por república

:heavy_check_mark: Aceite e recusa

:heavy_check_mark: Navegação padronizada nas telas de convites

### Gestão de Moradores

:heavy_check_mark: Listagem de moradores por república

:heavy_check_mark: Exibição de dados (e-mail, telefone, Pix)

:heavy_check_mark: Cópia rápida da chave Pix com feedback visual (ícone de sucesso/erro)

:heavy_check_mark: Redirecionamento para contato (WhatsApp/telefone) direto do card

:heavy_check_mark: Controle de permissões (ADMIN / USER)

### Contas e pagamentos

:heavy_check_mark: Cadastro de contas compartilhadas com navegação por abas (dados da conta / seleção de moradores)

:heavy_check_mark: Associação de moradores às contas

:heavy_check_mark: Divisão igualitária ou com valores customizados por morador

:heavy_check_mark: Cálculo automático de distribuição igualitária com valores customizados que respeitam o total

:heavy_check_mark: Filtro por mês de referência

:heavy_check_mark: Separação entre contas pendentes e pagas

:heavy_check_mark: Menu contextual por toque longo no card da conta

:heavy_check_mark: Cópia da chave Pix diretamente do card da conta com feedback visual

:heavy_check_mark: Remoção de contas com restrição por perfil (`ADMIN`)

:heavy_check_mark: Marcação e remoção de contas (com undo)

:heavy_check_mark: Restauração de contas deletadas (undo estendido)

:heavy_check_mark: Seleção de método de pagamento (PIX, Cartão, Dinheiro) na criação da conta

### Controle Financeiro

:heavy_check_mark: Resumo financeiro por república:

- Total geral

- Total pago

- Total pendente

- Dívida por morador

### Fluxo de contas e pagamentos

:heavy_check_mark: Status da conta: `PENDENTE`, `PAGA` e `ATRASADA`

:heavy_check_mark: Fluxo de status do pagamento por morador: `PENDENTE` → `AGUARDANDO_CONFIRMACAO` → `PAGO`

:heavy_check_mark: Confirmação de pagamentos pelo admin

:heavy_check_mark: Filtros por status para gestão

---

## Arquitetura

O projeto segue arquitetura orientada a domínios (feature-based), onde cada domínio de negócio vive de forma isolada dentro de `src/features/`.

```text
src/
├── app/                          # Rotas file-based com Expo Router
│   ├── (auth)/                   # Login, onboarding, checkEmail
│   ├── (republics)/[id]/         # República com abas dinâmicas
│   ├── (userProfile)/            # Perfil, convites, cadastro de república
│   ├── privacy-policy.tsx        # Tela de política de privacidade
│   └── terms-of-use.tsx          # Tela de termos de uso
│
├── features/
│   ├── auth/                     # Autenticação, contexto de sessão, Google Sign-In
│   ├── republic/                 # CRUD de repúblicas, contexto de listagem
│   ├── residents/                # Listagem e detalhes de moradores
│   ├── invites/                  # Envio, recebimento e gestão de convites
│   ├── accounts/                 # Contas compartilhadas e pagamentos
│   ├── legal/                    # Exibição de termos de uso e política de privacidade
│   └── user/                     # Perfil, edição de dados e listagem de repúblicas
│
├── hooks/                        # Hooks globais (useAppReady, useAppFonts)
├── lib/                          # Inicialização de libs externas (Sentry, Google Sign-In, Fonts)
├── providers/                    # AppProviders — composição centralizada de providers
│
├── services/
│   ├── api.ts                    # Axios com bearer token via SecureStore, timeout, circuit breaker e interceptors
│   ├── httpError.ts              # Normalização de erros HTTP
│   └── queryClient.ts            # Configuração global do React Query
│
└── shared/
    ├── components/               # ScreenLayout, SideMenu, ContextMenu, Tabs, error boundaries, UI base
    │   └── ui/                   # Componentes base: Button, Input, LoadingScreen, EmptyState, etc.
    ├── constants/                # Conteúdo legal, configurações de feedback de cópia Pix
    ├── contexts/                 # RefreshContext para coordenação global de recargas
    ├── hooks/                    # Hooks compartilhados (useCopyFeedback, useComponentLogger, etc.)
    ├── types/                    # Tipos globais (Resident, Resume, assets)
    └── utils/                    # Formatação (BRL), máscaras (moeda, telefone), logger, toasts
```

### Componentes compartilhados (`src/shared/components/`)

O projeto conta com uma biblioteca de componentes reutilizáveis:

| Componente              | Descrição                                      |
| ---------------------- | ---------------------------------------------- |
| `ScreenLayout`         | Layout padrão de tela com header configurável   |
| `ContextMenu`          | Menu contextual com posicionamento dinâmico    |
| `Tabs`                | Navegação por abas com indicador animado        |
| `ErrorBoundary`       | Captura e tratamento de erros por rota         |
| `LoadingScreen`       | Tela de carregamento com mensagem               |
| `EmptyState`          | Estado vazio com ícone e mensagem               |
| `NextButton`          | Botão primário com ações next/cancel           |
| `Header`              | Header padrão com título e ações opcionais      |
| `Toast`               | Notificações via Sonner Native                 |

Cada feature segue a mesma estrutura interna:

```text
features/<domínio>/
├── screens/      # Componentes de tela (conectam tudo)
├── components/   # UI específica do domínio
├── hooks/        # Lógica de estado e efeitos colaterais
├── services/     # Chamadas à API
├── types/        # Tipagem do domínio
├── utils/        # Utilitários do domínio (formatação, validação, helpers)
├── constants/    # Constantes do domínio
└── contexts/     # Contexto React quando necessário
```

---

## Navegação

O app usa Expo Router com rotas file-based e grupos de layout.

### Fluxo de autenticação

```
/(auth)/login → /(auth)/onboarding → /(userProfile)/profile
```

### Redirecionamento inicial (`app/index.tsx`)

| Condição          | Destino                            |
| ----------------- | ---------------------------------- |
| Carregando sessão | `LoadingScreen`                    |
| Sem usuário       | `/(auth)/login`                    |
| Perfil incompleto | `/(auth)/onboarding`               |
| Com `republicData` em cache local | `/(republics)/[rep.id]` |
| Sem república     | `/(userProfile)/profile`           |

Hoje, o redirecionamento automático para uma república depende do cache local `republic-data`. Sem esse dado salvo, o fluxo segue para `/(userProfile)/profile`.

### Rotas de perfil

- `/(userProfile)/profile` — hub principal com listagem de repúblicas
- `/(userProfile)/invites` — caixa de entrada de convites
- `/(userProfile)/register/republic` — cadastro de nova república

### Rotas da república

- `/(republics)/[id]` — tela principal com abas (Contas / Moradores / Resumo)
- `/(republics)/[id]/invites-sent` — convites enviados para a república
- `/(republics)/[id]/payments` — confirmação de pagamentos (admin)

---

## Pré-requisitos

:warning: [Node.js 18+](https://nodejs.org/en/download/)

:warning: [Expo CLI](https://docs.expo.dev/get-started/set-up-your-environment/)

:warning: [EAS CLI](https://docs.expo.dev/eas/environment-variables/)

:warning: Android Studio (para emulador Android) e/ou Xcode (para simulador iOS)

:warning: Backend da API em execução (local ou Railway)

---

## Como rodar a aplicação :arrow_forward:

### 1. Clone o repositório

```bash
git clone https://github.com/warlleyrocha/kontas
cd kontas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Puxe as variáveis de ambiente com EAS

O projeto usa variáveis de ambiente sincronizadas pelo EAS. Para desenvolvimento local, gere o arquivo `.env` com:

```bash
eas env:pull --environment development --path .env
```

O `app.config.ts` carrega `.env` automaticamente quando o app roda no dev server. Se estiver usando backend local no Android Emulator, mantenha `EXPO_PUBLIC_API_URL=http://10.0.2.2:3333`.

### 4. Execute

O app usa plugins nativos (Google Sign-In, Image Picker), então é necessário usar um **Development Build** ou build nativa local — o Expo Go não é suportado.

```bash
# Inicia o servidor Expo com dev-client
npm run dev

# Abre diretamente no emulador Android
npm run android

# Abre no simulador iOS
npm run ios
```

---

## Scripts disponíveis

| Script                  | O que faz                                           |
| ----------------------- | --------------------------------------------------- |
| `npm run start`         | Inicia o servidor Expo                              |
| `npm run dev`           | Inicia com dev-client                               |
| `npm run android`       | Build e abre no Android                             |
| `npm run ios`           | Build e abre no iOS                                 |
| `npm run web`           | Servidor web com Metro                              |
| `npm run lint`          | Executa o ESLint                                    |
| `npm run lint:biome`    | Executa o Biome em modo de verificação              |
| `npm run fix:biome`     | Corrige verificações do Biome                       | 
| `npm run format`        | Formata o código com Biome                          |
| `npm test`              | Roda o Jest em modo watch                           |
| `npm run test:coverage` | Gera cobertura de testes                            |
| `npm run sonar:scan`    | Executa cobertura + scanner SonarQube               |
| `npm run reset-project` | Reseta o template Expo base (script destrutivo)     |

---

## Build e distribuição

Perfis definidos em `eas.json`. As variáveis de ambiente (incluindo `EXPO_PUBLIC_API_URL`) são gerenciadas pelo EAS Environments — não há valores hardcoded nos perfis de build.

| Perfil        | Distribuição           | Ambiente EAS    |
| ------------- | ---------------------- | --------------- |
| `development` | Interna (dev client)   | `development`   |
| `preview`     | Interna (APK)          | `preview`       |
| `production`  | App Store / Play Store | `production`    |

```bash
# Build de preview para Android
eas build --platform android --profile preview

# Build de produção para iOS
eas build --platform ios --profile production
```

---

## Integração com API

O backend é hospedado no Railway: `https://kontas-back-end-production.up.railway.app`

Repositório da API: `https://github.com/Ameglebm/kontas-back-end`

### Camada HTTP (`src/services/api.ts`)

- **Bearer token automático** — injeta o JWT (armazenado via SecureStore) em toda requisição autenticada
- **Circuit breaker** — abre após 3 falhas consecutivas, fecha após 10 segundos
- **Timeout** — 10 segundos por requisição
- **Logs HTTP** — integração com o logger estruturado do app
- **Normalização de erros** — mensagens amigáveis independente do formato da API
- **Compatibilidade com payloads nulos/opcionais** — a UI trata campos como `nome`, `fotoPerfil`, `telefone`, `chavePix` e `metodoPagamento` conforme o retorno atual da API

### Endpoints consumidos

| Domínio    | Endpoints                                                                                                                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth       | `POST /auth/google`, `POST /auth/completar-dados`                                                                                                                                                                          |
| Usuário    | `GET /usuarios/me`, `PATCH /usuarios/atualizar-perfil`                                                                                                                                                                     |
| Repúblicas | `GET/POST /republicas`, `GET/PATCH/DELETE /republicas/:id`                                                                                                                                                                 |
| Moradores  | `GET /moradores/republica/:id`                                                                                                                                                                                             |
| Convites   | `POST /convites`, `GET /convites/me`, `GET /convites/republica/:id`, `PATCH /convites/:id`                                                                                                                                 |
| Contas     | `POST /contas`, `GET /contas/republica/:id`, `PATCH/DELETE /contas/:id`, `PATCH /contas/:id/restaurar`                                                                                                                     |
| Pagamentos | `POST /contas-moradores`, `GET /contas-moradores/conta/:id`, `GET /contas-moradores/morador/:id`, `PATCH /contas-moradores/:id/pagar`, `PATCH /contas-moradores/:id/confirmar` |

---

## Qualidade e observabilidade

- **Sentry** — rastreamento de erros e crashes em tempo real
- **Error boundary global** — evita que erros derrubem toda a UI
- **Error boundaries por rota** — isolamento de falhas por domínio de navegação
- **Toasts padronizados** — via Sonner Native para feedback de sucesso e erro
- **Logger estruturado** — centraliza logs e breadcrumbs usados pelo app
- **React Query** — cache e sincronização de estado do servidor com stale-while-revalidate
- **Jest + Testing Library** — cobertura ampla cobrindo rotas, hooks, serviços, componentes, contextos, utilitários e configuração do app
- **Biome** — formatação e lint unificados
- **SonarQube local** — via Docker Compose para análise estática

```bash
# Sobe o SonarQube localmente
docker compose up --build

# Roda o scanner
npm run sonar:scan
```

---

## Pontos de atenção

:memo: A rota `/(auth)/checkEmail` existe como tela isolada, mas não participa do fluxo principal de autenticação.

:memo: O menu contextual da conta possui a ação de edição comentada aguardando implementação do endpoint de atualização.

:memo: Para CI e cobertura de testes, prefira `npm run test:coverage`, já que `npm test` roda em modo watch.

---

## Documentos legais

- [`docs/terms-of-use.md`](docs/terms-of-use.md)
- [`docs/privacy-policy.md`](docs/privacy-policy.md)
- [`LICENSE`](LICENSE)

---

## Tecnologias utilizadas :books:

| Tecnologia                                                                     | Uso                                    |
| ------------------------------------------------------------------------------ | -------------------------------------- |
| [Expo](https://expo.dev/)                                                      | Plataforma de build e runtime          |
| [React Native](https://reactnative.dev/)                                       | Framework mobile                       |
| [TypeScript](https://www.typescriptlang.org/)                                  | Tipagem estática                       |
| [Expo Router](https://expo.github.io/router/)                                  | Navegação file-based                   |
| [NativeWind](https://www.nativewind.dev/)                                      | Tailwind CSS para React Native         |
| [React Query](https://tanstack.com/query)                                      | Gerenciamento de estado do servidor    |
| [Axios](https://axios-http.com/)                                               | Cliente HTTP com interceptors          |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | Animações nativas                      |
| [Google Sign-In](https://github.com/react-native-google-signin/google-signin)  | Autenticação OAuth                     |
| [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)     | Armazenamento seguro de credenciais    |
| [Sentry](https://sentry.io/)                                                   | Rastreamento de erros                  |
| [EAS](https://expo.dev/eas)                                                    | Build e distribuição                   |
| [Sonner Native](https://github.com/nickmanggei/sonner-native)                 | Toasts e notificações                  |
| [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)             | Feedback tátil                         |
| [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)   | Seleção de imagens da galeria           |
| [Expo Clipboard](https://docs.expo.dev/versions/latest/sdk/clipboard/)         | Cópia para área de transferência       |
| [Biome](https://biomejs.dev/)                                                  | Lint e formatação de código            |
| [Jest](https://jestjs.io/)                                                     | Testes unitários e de integração      |

---

## Desenvolvedor

| [<img src="https://github.com/warlleyrocha.png" width=115><br><sub>Warlley Rocha</sub>](https://github.com/warlleyrocha) |
| :----------------------------------------------------------------------------------------------------------------------: |

---

## Licença

Este projeto possui licença proprietária. Consulte [`LICENSE`](LICENSE) para os termos completos de uso, distribuição e restrições. Copyright (c) 2026 Éden. Todos os direitos reservados.
