# Kontas

Aplicativo mobile em Expo/React Native para organizar repúblicas, moradores, convites e contas compartilhadas.

## Estado atual do app

O projeto já cobre os fluxos principais de uso:

- autenticação com Google e sessão persistida;
- onboarding para completar perfil;
- edição de nome, telefone, chave Pix e foto;
- criação, listagem, edição e remoção de repúblicas;
- convites recebidos e convites enviados por república;
- listagem de moradores com acesso rápido à chave Pix;
- resumo financeiro com dados reais da API;
- gestão de contas compartilhadas com vínculo de moradores;
- confirmação de pagamento por morador e conferência pelo admin.

## Funcionalidades implementadas

### Autenticação e sessão

- Login com Google.
- Persistência local de `token` e `user` em `AsyncStorage`.
- Validação de sessão no carregamento do app.
- Logout com limpeza da sessão local e do Google Sign-In.

### Perfil e onboarding

- Fluxo de onboarding para usuários com `perfilCompleto = false`.
- Edição de perfil com foto, telefone e chave Pix.
- Validação de campos obrigatórios ao concluir o cadastro.
- Links para Termos de Uso e Política de Privacidade via variáveis públicas.

### Repúblicas

- Criação de república com nome e imagem.
- Listagem das repúblicas do usuário.
- Tela da república com abas de `Resumo`, `Contas` e `Moradores`.
- Edição e exclusão de república.
- Painel de controle com ações administrativas.

### Convites

- Envio de convite por e-mail para uma república.
- Caixa de entrada de convites do usuário.
- Aceite e recusa de convite.
- Listagem de convites enviados por república.

### Moradores

- Listagem de moradores por república.
- Exibição de e-mail, telefone e chave Pix.
- Cópia da chave Pix no card do morador.
- Identificação de papel do morador (`ADMIN` ou `USER`) para navegação contextual.

### Contas e pagamentos

- Cadastro de contas por república.
- Seleção dos moradores vinculados à conta.
- Filtro por mês de referência.
- Separação entre contas em aberto e pagas.
- Marcação de conta como paga.
- Remoção de conta com janela de desfazer.
- Recuperação de conta removida.
- Resumo com total geral, total pago, total pendente e dívida por morador.
- Fluxo de pagamento por morador com status:
  - `PENDENTE`
  - `AGUARDANDO_CONFIRMACAO`
  - `PAGO`
- Tela de pagamentos para conferência do admin.

## Arquitetura

```text
.
├── src/
│   ├── app/                # Rotas com Expo Router
│   ├── components/         # UI compartilhada, SideMenu, Tabs, error boundaries
│   ├── features/           # Domínios do app
│   │   ├── accounts/
│   │   ├── auth/
│   │   ├── invites/
│   │   ├── republic/
│   │   ├── residents/
│   │   └── user/
│   ├── services/           # API HTTP e tratamento de erro
│   ├── shared/             # contexts, constants, hooks e types compartilhados
│   └── utils/              # formatação, máscaras e toasts
├── docs/                   # documentos legais
├── app.config.ts           # config dinâmica por ambiente
├── eas.json                # perfis de build EAS
├── docker-compose.yml      # stack local para SonarQube
└── README.md
```

## Navegação principal

### Rotas de autenticação

- `/(auth)/login`
- `/(auth)/onboarding`
- `/(auth)/checkEmail`

### Rotas de perfil

- `/(userProfile)/profile`
- `/(userProfile)/invites`
- `/(userProfile)/control-panel`
- `/(userProfile)/register/republic`

### Rotas da república

- `/(republics)/[id]`
- `/(republics)/[id]/invites-sent`
- `/(republics)/[id]/payments`

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- NativeWind
- Axios
- Reanimated
- AsyncStorage
- Google Sign-In
- Expo Image Picker
- Sonner Native
- Sentry

## Integração com API

O app hoje consome dados via REST com `Axios`.

### Endpoints usados no app

- `POST /auth/google`
- `POST /auth/completar-dados`
- `GET /usuarios/me`
- `PATCH /usuarios/atualizar-perfil`
- `GET /republicas`
- `POST /republicas`
- `GET /republicas/:id`
- `PATCH /republicas/:id`
- `DELETE /republicas/:id`
- `GET /moradores/republica/:id`
- `POST /convites`
- `GET /convites/me`
- `GET /convites/republica/:id`
- `PATCH /convites/:id`
- `POST /contas`
- `GET /contas/republica/:id`
- `DELETE /contas/:id`
- `PATCH /contas/:id`
- `PATCH /contas/:id/restaurar`
- `POST /contas-moradores`
- `GET /contas-moradores/conta/:id`
- `GET /contas-moradores/morador/:id`
- `PATCH /contas-moradores/:id/pagar`
- `PATCH /contas-moradores/:id/confirmar`
- `PATCH /contas-moradores/:id/visibilidade`

### Camada HTTP

`src/services/api.ts` concentra:

- `baseURL` baseada em `EXPO_PUBLIC_API_URL`;
- injeção automática do token Bearer;
- timeout de 10 segundos;
- retry com backoff exponencial e jitter para requisições seguras;
- circuit breaker para falhas repetidas;
- logs HTTP em desenvolvimento;
- normalização de erros para mensagens amigáveis.

### Pré-requisitos

- Node.js 18+
- npm
- Android Studio e/ou Xcode
- backend da API em execução

### Ambiente

Para desenvolvimento local, crie um `.env.local` na raiz:

```env
APP_ENV=development
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333
EXPO_PUBLIC_TERMS_OF_USE_URL=https://seu-dominio/terms
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://seu-dominio/privacy
SONAR_TOKEN=seu_token_sonar
```

Observações:

- `EXPO_PUBLIC_API_URL` é obrigatória em runtime.
- `EXPO_PUBLIC_TERMS_OF_USE_URL` e `EXPO_PUBLIC_PRIVACY_POLICY_URL` alimentam os links legais.
- `app.config.ts` carrega `.env.local` apenas no dev server e apenas quando a variável ainda não estiver definida no ambiente.
- Em emulador Android, `10.0.2.2` aponta para a máquina host. Em dispositivo físico, ajuste a URL para o IP da sua rede.

## Executando o projeto

Como o app usa plugins nativos como Google Sign-In e Image Picker, o fluxo principal deve ser testado em Development Build ou build nativa local.

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run android
npm run dev
```

Alternativas:

```bash
npm run ios
npm start
npm run web
```

## Scripts disponíveis

```bash
npm run start
npm run dev
npm run android
npm run ios
npm run web
npm run lint
npm test
npm run reset-project
```

Observação: `jest` está configurado, mas o repositório ainda não possui suítes de teste versionadas.

## Build e distribuição

Perfis definidos em `eas.json`:

- `development`
- `preview`
- `production`

Configuração atual:

- `development` usa `APP_ENV=development` e `EXPO_PUBLIC_API_URL=http://10.0.2.2:3333`
- `preview` usa a API em `https://kontas-back-end-production.up.railway.app`
- `production` usa a API em `https://kontas-back-end-production.up.railway.app`

Exemplos:

```bash
eas build --platform android --profile preview
eas build --platform ios --profile production
```

## Qualidade e observabilidade

- Sentry inicializado no layout raiz.
- Error boundary global e error boundaries por domínio de rota.
- Toasts padronizados para sucesso e erro.
- SonarQube local com Docker Compose.

### SonarQube

```bash
docker-compose up -d
docker-compose run --rm node-sonar
```

## Pontos de atenção no estado atual

- A UI do modal de conta já oferece `Valores customizados`, mas o payload enviado hoje vincula apenas `moradorIds` e `valorTotal`.
- As ações de editar conta, copiar Pix direto do card da conta e o botão flutuante de adicionar república no painel ainda estão em placeholder no frontend.
- A rota `/(auth)/checkEmail` existe como tela isolada, mas não participa do fluxo principal do app neste momento.

## Documentos legais

- `docs/privacy-policy.md`
- `docs/terms-of-use.md`

## Autor

Warlley Rocha  
GitHub: [@warlleyrocha](https://github.com/warlleyrocha)
