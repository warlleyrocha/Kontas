export type Block =
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "numbered"; items: string[] }
  | { kind: "table"; headers: [string, string]; rows: [string, string][] };

export type Section = {
  title: string;
  blocks: Block[];
};

export type LegalDoc = {
  title: string;
  lastUpdated: string;
  sections: Section[];
};

export const privacyPolicy: LegalDoc = {
  title: "Política de Privacidade",
  lastUpdated: "março de 2026",
  sections: [
    {
      title: "1. Introdução",
      blocks: [
        {
          kind: "p",
          text: "Esta Política de Privacidade descreve como o aplicativo Kontas, de propriedade da Éden, coleta, utiliza, armazena e compartilha suas informações pessoais. Ao utilizar o App, você concorda com as práticas descritas neste documento, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).",
        },
      ],
    },
    {
      title: "2. Dados Coletados",
      blocks: [
        { kind: "h3", text: "2.1. Dados fornecidos pelo Google (OAuth)" },
        {
          kind: "p",
          text: "Ao fazer login com o Google, recebemos:",
        },
        {
          kind: "bullets",
          items: ["Nome completo", "Endereço de e-mail", "Foto de perfil"],
        },
        {
          kind: "p",
          text: "Esses dados são usados para identificar você no App e pré-preencher seu perfil.",
        },
        { kind: "h3", text: "2.2. Dados fornecidos por você" },
        {
          kind: "p",
          text: "Durante o uso do App, você pode fornecer:",
        },
        {
          kind: "bullets",
          items: [
            "Nome: exibido para outros moradores da república.",
            "Telefone: exibido para outros moradores da república.",
            "Chave Pix: exibida para outros moradores da república para facilitar pagamentos.",
            "Foto de perfil: exibida no App (upload via câmera ou galeria).",
          ],
        },
        { kind: "h3", text: "2.3. Dados gerados pelo uso do App" },
        {
          kind: "bullets",
          items: [
            "Dados de sessão: token JWT armazenado localmente no dispositivo via AsyncStorage para manter você autenticado.",
            "Dados de uso e erros: o App utiliza o Sentry para rastreamento de erros e crashes. Isso pode incluir informações técnicas sobre o dispositivo, versão do sistema operacional, stack trace de erros e breadcrumbs de navegação. Não são coletados dados financeiros ou senhas por essa ferramenta.",
          ],
        },
      ],
    },
    {
      title: "3. Finalidade do Tratamento",
      blocks: [
        {
          kind: "table",
          headers: ["Dado", "Finalidade"],
          rows: [
            ["Nome e foto", "Identificação nas telas da república e perfil"],
            [
              "E-mail",
              "Login, envio e recebimento de convites entre moradores",
            ],
            ["Telefone", "Exibição para moradores da mesma república"],
            [
              "Chave Pix",
              "Exibição para moradores da mesma república para facilitar pagamentos",
            ],
            [
              "Token JWT (local)",
              "Manter sessão autenticada sem necessidade de novo login",
            ],
            [
              "Dados de erro (Sentry)",
              "Monitoramento de qualidade e estabilidade do App",
            ],
          ],
        },
      ],
    },
    {
      title: "4. Compartilhamento de Dados",
      blocks: [
        { kind: "h3", text: "4.1. Entre moradores da república" },
        {
          kind: "p",
          text: "Ao ingressar em uma república, os seguintes dados ficam visíveis para os demais moradores e para o administrador: nome, e-mail, telefone, foto de perfil e chave Pix.",
        },
        { kind: "h3", text: "4.2. Com terceiros" },
        {
          kind: "bullets",
          items: [
            "Google: utilizado exclusivamente para autenticação via OAuth. O Kontas não acessa outros dados da sua conta Google além dos mencionados na seção 2.1.",
            "Sentry: recebe dados técnicos de erros e uso para fins de monitoramento.",
            "Railway: a API do Kontas é hospedada no Railway. Os dados trafegam de forma criptografada (HTTPS) entre o App e o servidor.",
          ],
        },
        {
          kind: "p",
          text: "O Kontas não vende, aluga ou compartilha seus dados pessoais com terceiros para fins comerciais ou publicitários.",
        },
      ],
    },
    {
      title: "5. Armazenamento e Segurança",
      blocks: [
        {
          kind: "numbered",
          items: [
            "Os dados são armazenados em servidor hospedado no Railway, com comunicação protegida por HTTPS.",
            "A autenticação é realizada via token JWT com envio automático em todas as requisições autenticadas.",
            "A camada HTTP do App conta com circuit breaker e timeout para proteger contra falhas de rede.",
            "O token de sessão é armazenado localmente no dispositivo via AsyncStorage e removido ao realizar logout.",
            "Nenhuma senha é armazenada pelo Kontas. A autenticação é delegada ao Google.",
          ],
        },
      ],
    },
    {
      title: "6. Seus Direitos (LGPD)",
      blocks: [
        { kind: "p", text: "Você tem direito a:" },
        {
          kind: "bullets",
          items: [
            "Acesso: solicitar quais dados seus estão armazenados.",
            "Correção: atualizar dados incorretos ou desatualizados diretamente no App, na tela de perfil.",
            "Exclusão: solicitar a remoção dos seus dados pessoais.",
            "Portabilidade: solicitar uma cópia dos seus dados em formato legível.",
            "Revogação do consentimento: você pode revogar o acesso do Kontas à sua conta Google a qualquer momento nas configurações da sua conta Google.",
            "Oposição: contestar o tratamento de dados em determinadas situações.",
          ],
        },
        {
          kind: "p",
          text: "Para exercer qualquer um desses direitos, entre em contato pelo canal indicado na seção 9.",
        },
      ],
    },
    {
      title: "7. Retenção de Dados",
      blocks: [
        {
          kind: "p",
          text: "Seus dados são mantidos enquanto sua conta estiver ativa. Ao solicitar a exclusão da conta, seus dados pessoais serão removidos, exceto quando houver obrigação legal de retenção ou quando os dados forem necessários para preservar registros de obrigações financeiras de outros moradores da república.",
        },
      ],
    },
    {
      title: "8. Uso por Menores",
      blocks: [
        {
          kind: "p",
          text: "O Kontas não é destinado a usuários menores de 18 anos. Não coletamos intencionalmente dados de menores de idade.",
        },
      ],
    },
    {
      title: "9. Contato",
      blocks: [
        {
          kind: "p",
          text: "Para dúvidas, solicitações relacionadas à privacidade ou exercício dos seus direitos previstos na LGPD, entre em contato com o responsável pelo App:",
        },
        {
          kind: "p",
          text: "Warlley Rocha\nGitHub: github.com/warlleyrocha",
        },
      ],
    },
    {
      title: "10. Alterações nesta Política",
      blocks: [
        {
          kind: "p",
          text: "Esta Política pode ser atualizada periodicamente. Notificações sobre alterações relevantes serão exibidas no App. O uso continuado após a publicação implica aceitação da versão atualizada.",
        },
      ],
    },
  ],
};

export const termsOfUse: LegalDoc = {
  title: "Termos de Uso",
  lastUpdated: "março de 2026",
  sections: [
    {
      title: "1. Aceitação dos Termos",
      blocks: [
        {
          kind: "p",
          text: "Ao criar uma conta, acessar ou utilizar o aplicativo Kontas você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize o App.",
        },
      ],
    },
    {
      title: "2. Descrição do Serviço",
      blocks: [
        {
          kind: "p",
          text: "O Kontas é um aplicativo mobile de gestão financeira colaborativa voltado para repúblicas e moradias compartilhadas. Ele permite que moradores organizem contas coletivas, acompanhem pagamentos individuais e gerenciem a divisão de despesas entre si.",
        },
      ],
    },
    {
      title: "3. Cadastro e Autenticação",
      blocks: [
        {
          kind: "numbered",
          items: [
            "O acesso ao App é feito exclusivamente por meio de login com conta Google (OAuth). Ao autenticar-se, você autoriza o Kontas a receber seu nome, endereço de e-mail e foto de perfil fornecidos pelo Google.",
            "Após o login, você deverá completar seu perfil com informações adicionais, como nome, telefone e chave Pix, necessárias para o funcionamento das funcionalidades colaborativas.",
            "Você é responsável pela veracidade das informações fornecidas e pela segurança do acesso à sua conta.",
          ],
        },
      ],
    },
    {
      title: "4. Funcionalidades e Regras de Uso",
      blocks: [
        { kind: "h3", text: "4.1. Repúblicas" },
        {
          kind: "bullets",
          items: [
            "Qualquer usuário pode criar uma república e se tornar seu administrador.",
            "O administrador pode editar dados da república, gerenciar moradores, confirmar pagamentos e excluir a república.",
            "A exclusão de uma república é irreversível e elimina todos os dados associados a ela.",
          ],
        },
        { kind: "h3", text: "4.2. Convites" },
        {
          kind: "bullets",
          items: [
            "O administrador pode convidar novos moradores por e-mail.",
            "O usuário convidado pode aceitar ou recusar o convite.",
            "Ao aceitar um convite, seus dados de perfil (nome, e-mail, telefone e chave Pix) ficam visíveis para os demais moradores da república.",
          ],
        },
        { kind: "h3", text: "4.3. Contas e Pagamentos" },
        {
          kind: "bullets",
          items: [
            "Contas compartilhadas podem ser cadastradas e associadas a moradores específicos.",
            "Moradores podem marcar seus pagamentos como realizados; o administrador confirma o recebimento.",
            "O administrador tem permissão exclusiva para remover contas da república.",
          ],
        },
        { kind: "h3", text: "4.4. Dados de Contato e Pix" },
        {
          kind: "bullets",
          items: [
            "Ao preencher telefone e chave Pix no perfil, você declara que esses dados são seus e que autoriza sua exibição para os demais moradores das repúblicas das quais faz parte.",
            "O Kontas não realiza nem intermedia transações financeiras. A chave Pix é exibida apenas para facilitar a comunicação entre moradores.",
          ],
        },
      ],
    },
    {
      title: "5. Responsabilidades do Usuário",
      blocks: [
        {
          kind: "numbered",
          items: [
            "Você é o único responsável pelos pagamentos realizados fora do App, utilizando os dados de contato ou Pix de outros moradores.",
            "Não é permitido utilizar o App para fins ilegais, fraudulentos ou que prejudiquem outros usuários.",
            "Você concorda em não compartilhar sua conta com terceiros.",
          ],
        },
      ],
    },
    {
      title: "6. Responsabilidades do Kontas",
      blocks: [
        {
          kind: "numbered",
          items: [
            "O Kontas emprega boas práticas de segurança, incluindo autenticação via token JWT, circuit breaker e monitoramento de erros com Sentry.",
            "O App é fornecido como está. Não garantimos disponibilidade ininterrupta, sendo possível ocorrer indisponibilidades por manutenção ou falhas técnicas.",
            "O Kontas não se responsabiliza por disputas financeiras entre moradores, pagamentos realizados incorretamente ou uso indevido de dados de terceiros exibidos no App.",
          ],
        },
      ],
    },
    {
      title: "7. Propriedade Intelectual",
      blocks: [
        {
          kind: "p",
          text: "Todo o código, design, documentação associada e conteúdo do Kontas são de propriedade exclusiva da Éden. É proibida a reprodução, distribuição, modificação, sublicenciamento ou uso sem autorização prévia e expressa por escrito.",
        },
      ],
    },
    {
      title: "8. Encerramento de Conta",
      blocks: [
        {
          kind: "p",
          text: "Você pode solicitar a exclusão da sua conta a qualquer momento. Ao excluir sua conta, seus dados pessoais serão removidos, salvo quando houver obrigação legal de retenção ou quando os dados forem necessários para preservar obrigações de outros moradores da república.",
        },
      ],
    },
    {
      title: "9. Alterações nos Termos",
      blocks: [
        {
          kind: "p",
          text: "O Kontas pode atualizar estes Termos a qualquer momento. Notificações sobre mudanças relevantes serão exibidas no App. O uso continuado após a publicação de novos termos implica aceitação.",
        },
      ],
    },
    {
      title: "10. Legislação Aplicável",
      blocks: [
        {
          kind: "p",
          text: "Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de domicílio do desenvolvedor para resolução de eventuais conflitos.",
        },
      ],
    },
    {
      title: "11. Contato",
      blocks: [
        {
          kind: "p",
          text: "Dúvidas ou solicitações relacionadas a estes Termos podem ser enviadas para o desenvolvedor responsável pelo App.",
        },
      ],
    },
  ],
};
