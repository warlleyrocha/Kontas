# Política de Privacidade — Kontas

**Última atualização:** março de 2026

---

## 1. Introdução

Esta Política de Privacidade descreve como o aplicativo Kontas ("App"), de propriedade da Éden, coleta, utiliza, armazena e compartilha suas informações pessoais. Ao utilizar o App, você concorda com as práticas descritas neste documento, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).

---

## 2. Dados Coletados

### 2.1. Dados fornecidos pelo Google (OAuth)

Ao fazer login com o Google, recebemos:

- Nome completo
- Endereço de e-mail
- Foto de perfil

Esses dados são usados para identificar você no App e pré-preencher seu perfil.

### 2.2. Dados fornecidos por você

Durante o uso do App, você pode fornecer:

- **Nome:** exibido para outros moradores da república.
- **Telefone:** exibido para outros moradores da república.
- **Chave Pix:** exibida para outros moradores da república para facilitar pagamentos.
- **Foto de perfil:** exibida no App (upload via câmera ou galeria).

### 2.3. Dados gerados pelo uso do App

- **Dados de sessão:** token JWT armazenado localmente no dispositivo via AsyncStorage para manter você autenticado.
- **Dados de uso e erros:** o App utiliza o Sentry para rastreamento de erros e crashes. Isso pode incluir informações técnicas sobre o dispositivo, versão do sistema operacional, stack trace de erros e breadcrumbs de navegação. Não são coletados dados financeiros ou senhas por essa ferramenta.

---

## 3. Finalidade do Tratamento

| Dado                   | Finalidade                                                           |
| ---------------------- | -------------------------------------------------------------------- |
| Nome e foto            | Identificação nas telas da república e perfil                        |
| E-mail                 | Login, envio e recebimento de convites entre moradores               |
| Telefone               | Exibição para moradores da mesma república                           |
| Chave Pix              | Exibição para moradores da mesma república para facilitar pagamentos |
| Token JWT (local)      | Manter sessão autenticada sem necessidade de novo login              |
| Dados de erro (Sentry) | Monitoramento de qualidade e estabilidade do App                     |

---

## 4. Compartilhamento de Dados

### 4.1. Entre moradores da república

Ao ingressar em uma república, os seguintes dados ficam visíveis para os demais moradores e para o administrador: nome, e-mail, telefone, foto de perfil e chave Pix.

### 4.2. Com terceiros

- **Google:** utilizado exclusivamente para autenticação via OAuth. O Kontas não acessa outros dados da sua conta Google além dos mencionados na seção 2.1.
- **Sentry:** recebe dados técnicos de erros e uso para fins de monitoramento. Mais informações em [sentry.io/privacy](https://sentry.io/privacy).
- **Railway:** a API do Kontas é hospedada no Railway. Os dados trafegam de forma criptografada (HTTPS) entre o App e o servidor.

O Kontas não vende, aluga ou compartilha seus dados pessoais com terceiros para fins comerciais ou publicitários.

---

## 5. Armazenamento e Segurança

5.1. Os dados são armazenados em servidor hospedado no Railway, com comunicação protegida por HTTPS.

5.2. A autenticação é realizada via token JWT com envio automático em todas as requisições autenticadas.

5.3. A camada HTTP do App conta com circuit breaker e timeout para proteger contra falhas de rede.

5.4. O token de sessão é armazenado localmente no dispositivo via AsyncStorage e removido ao realizar logout.

5.5. Nenhuma senha é armazenada pelo Kontas. A autenticação é delegada ao Google.

---

## 6. Seus Direitos (LGPD)

Você tem direito a:

- **Acesso:** solicitar quais dados seus estão armazenados.
- **Correção:** atualizar dados incorretos ou desatualizados diretamente no App, na tela de perfil.
- **Exclusão:** solicitar a remoção dos seus dados pessoais.
- **Portabilidade:** solicitar uma cópia dos seus dados em formato legível.
- **Revogação do consentimento:** você pode revogar o acesso do Kontas à sua conta Google a qualquer momento nas configurações da sua conta Google.
- **Oposição:** contestar o tratamento de dados em determinadas situações.

Para exercer qualquer um desses direitos, entre em contato pelo canal indicado na seção 9.

---

## 7. Retenção de Dados

Seus dados são mantidos enquanto sua conta estiver ativa. Ao solicitar a exclusão da conta, seus dados pessoais serão removidos, exceto quando houver obrigação legal de retenção ou quando os dados forem necessários para preservar registros de obrigações financeiras de outros moradores da república.

---

## 8. Uso por Menores

O Kontas não é destinado a usuários menores de 18 anos. Não coletamos intencionalmente dados de menores de idade.

---

## 9. Contato

Para dúvidas, solicitações relacionadas à privacidade ou exercício dos seus direitos previstos na LGPD, entre em contato com o responsável pelo App:

**Warlley Rocha**
GitHub: [github.com/warlleyrocha](https://github.com/warlleyrocha)

---

## 10. Alterações nesta Política

Esta Política pode ser atualizada periodicamente. Notificações sobre alterações relevantes serão exibidas no App. O uso continuado após a publicação implica aceitação da versão atualizada.
