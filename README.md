# Kontas 👋

Um aplicativo mobile para gestão financeira de repúblicas e moradia compartilhada, desenvolvido com React Native e Expo. O Kontas facilita o controle de contas, divisão de despesas e gerenciamento de moradores.

## 🚀 Começando

Essas instruções permitirão que você obtenha uma cópia do projeto em operação na sua máquina local para fins de desenvolvimento e teste.

Consulte **[Implantação](#-implantação)** para saber como implantar o projeto.

### 📋 Pré-requisitos

De que coisas você precisa para instalar o software e como instalá-lo?

```
Node.js (versão 18 ou superior)
npm ou yarn
Expo CLI
Android Studio (para emulador Android) ou Xcode (para iOS)
```

### 🔧 Instalação

Uma série de exemplos passo-a-passo que informam o que você deve executar para ter um ambiente de desenvolvimento em execução.

Primeiro, clone o repositório e instale as dependências:

```bash
git clone https://github.com/warlleyrocha/Kontas.git
cd Kontas
npm install
```

Configure o arquivo de ambiente (se necessário):

```bash
# Adicione suas credenciais do Google OAuth no diretório keys/
```

Inicie o servidor de desenvolvimento:

```bash
npx expo start
```

Escolha uma das opções disponíveis:

- Pressione `a` para abrir no emulador Android
- Pressione `i` para abrir no simulador iOS
- Escaneie o QR code com o Expo Go no seu dispositivo físico

## 📦 Implantação

Para fazer o build de produção do aplicativo:

**Android:**

```bash
npm run android
```

**iOS:**

```bash
npm run ios
```

**Web:**

```bash
npm run web
```

Para builds de produção com EAS (Expo Application Services), consulte a configuração em `eas.json`.

## 🛠️ Construído com

Ferramentas e tecnologias utilizadas no projeto:

- [Expo](https://expo.dev/) - Framework e plataforma para React Native
- [React Native](https://reactnative.dev/) - Framework mobile multiplataforma
- [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript com tipagem
- [NativeWind](https://www.nativewind.dev/) - Tailwind CSS para React Native
- [Expo Router](https://docs.expo.dev/router/introduction/) - Sistema de roteamento baseado em arquivos
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - Armazenamento local persistente
- [Google Sign-In](https://github.com/react-native-google-signin/google-signin) - Autenticação Google

## ✒️ Autores

Mencione todos aqueles que ajudaram a levantar o projeto desde o seu início

- **Warlley Rocha** - _Trabalho Inicial_ - [warlleyrocha](https://github.com/warlleyrocha)

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

---

⌨️ com ❤️ por [Warlley Rocha](https://github.com/warlleyrocha) 😊
