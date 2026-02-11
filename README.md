# Kontas

Aplicativo mobile (Expo/React Native) para gestão de repúblicas: autenticação, perfil, convites, moradores e contas compartilhadas.

## Visão Geral

O app usa:

- **REST (Axios)** para autenticação, usuário, repúblicas, moradores e convites.
- **GraphQL (Apollo Client)** para contas (`contasPorRepublica`, `criarConta`, `removerConta`).
- **Expo Router** para rotas baseadas em arquivos.
- **AsyncStorage** para persistência de sessão (`@app:token`, `@app:user`).
- **Sentry** para monitoramento de erros.

## Funcionalidades Implementadas

### Autenticação e Sessão

- Login com Google (`@react-native-google-signin/google-signin`).
- Validação de token com backend em inicialização.
- Cache local de usuário e token.
- Logout com limpeza de sessão.

### Perfil

- Fluxo de onboarding para novos usuários (`perfilCompleto = false`).
- Edição de nome, telefone, chave Pix e foto.
- Validação de campos obrigatórios ao completar perfil.

### Repúblicas

- Criar república com nome e imagem.
- Listar e abrir república.
- Atualizar e excluir república.
- Painel de controle com ações administrativas.

### Convites

- Envio de convite por e-mail para uma república.
- Listagem de convites recebidos (`/convites/me`).
- Aceitar ou recusar convite.
- Listagem de convites enviados por república.

### Moradores

- Listagem de moradores por república.
- Cópia de chave Pix para área de transferência.
- Controle de role por morador (`ADMIN`/`USER`) usado no menu/contexto.

### Contas (GraphQL)

- Listagem de contas por república.
- Cadastro de conta com:
  - descrição, valor total, vencimento, método de pagamento;
  - divisão igual ou customizada entre moradores selecionados.
- Filtro por mês de referência.
- Separação visual de contas abertas e pagas.
- Exclusão de conta.

## Pontos Em Evolução (estado atual do código)

- Aba **Resumo** usa dados mockados (`src/constants/resume.logic.ts`).
- Em `AccountCard`, parte de responsáveis/pagamento por morador ainda está marcada com `TODO`.
- Mutation `ATUALIZAR_STATUS_CONTA` existe, mas não está conectada na UI atual.

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- NativeWind (Tailwind)
- Apollo Client + GraphQL
- Axios
- Sonner Native (toasts)
- Sentry

## Estrutura Atual

```text
.
├── src/
│   ├── app/                      # Rotas (expo-router)
│   │   ├── (auth)/
│   │   ├── (userProfile)/
│   │   └── (republics)/[id]/
│   ├── features/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── republic/
│   │   ├── invites/
│   │   ├── residents/
│   │   └── accounts/
│   ├── services/                 # api axios, apollo client, tratamento de erro
│   ├── graphql/                  # queries/mutations/types de contas
│   ├── components/               # SideMenu, Tabs, UI, error boundaries
│   ├── constants/
│   └── utils/
├── docs/
│   ├── privacy-policy.md
│   └── terms-of-use.md
├── app.config.ts
├── eas.json
└── docker-compose.yml
```

## Pré-requisitos

- Node.js 18+
- npm
- Ambiente Expo (Android Studio/Xcode quando aplicável)

## Configuração de Ambiente

Crie `.env.local` para desenvolvimento local:

```env
APP_ENV=development
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333
EXPO_PUBLIC_TERMS_OF_USE_URL=https://seu-dominio/terms
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://seu-dominio/privacy
SONAR_TOKEN=seu_token_sonar
```

Variáveis importantes:

- `EXPO_PUBLIC_API_URL`: obrigatória para REST (app falha sem ela).
- `EXPO_PUBLIC_TERMS_OF_USE_URL` e `EXPO_PUBLIC_PRIVACY_POLICY_URL`: usadas nos links legais da tela de login/menu.
- `APP_ENV`: controla nome/config dinâmica no `app.config.ts`.

## Backend e Endpoints

### REST (base em `EXPO_PUBLIC_API_URL`)

- `POST /auth/google`
- `POST /auth/completar-dados`
- `GET /usuarios/me`
- `PATCH /usuarios/atualizar-perfil`
- `GET/POST/PATCH/DELETE /republicas`
- `GET /moradores/republica/:id`
- `POST /convites`
- `GET /convites/me`
- `GET /convites/republica/:id`
- `PATCH /convites/:inviteId`

### GraphQL (contas)

Atualmente definido em `src/services/apolloClient.ts`:

- URI: `http://10.0.2.2:3333/graphql`
- Query: `contasPorRepublica`
- Mutations: `criarConta`, `removerConta`, `atualizarStatus` (não usada na UI)

## Executar Projeto

```bash
npm install
npm start
```

Scripts disponíveis:

```bash
npm run start
npm run dev
npm run android
npm run ios
npm run web
npm run lint
npm run reset-project
```

## Build (EAS)

Perfis em `eas.json`:

- `development`
- `preview`
- `production`

Exemplos:

```bash
eas build --platform android --profile preview
eas build --platform ios --profile production
```

## Qualidade e Observabilidade

- **Error boundaries** globais e por domínio de rota.
- **Sentry** inicializado no layout raiz.
- **SonarQube** via Docker:

```bash
docker-compose up -d
docker-compose run --rm node-sonar
```

## Documentos Legais

- `docs/privacy-policy.md`
- `docs/terms-of-use.md`

## Autor

Warlley Rocha  
GitHub: [@warlleyrocha](https://github.com/warlleyrocha)
