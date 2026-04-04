export const slides = [
  {
    id: "1",
    title: "Crie sua república",
    description: "Cadastre sua república e organize as despesas da casa.",
    image:
      "https://images.unsplash.com/photo-1709080381729-965c62ab0471?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGFyZWQlMjBob3VzZSUyMGV4cGVuc2VzJTIwbWFuYWdlbWVudHxlbnwxfHx8fDE3NzUxNzM0NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "#337176",
  },
  {
    id: "2",
    title: "Convide os Moradores",
    description: "Adicione pessoas da casa para dividir as despesas.",
    image:
      "https://images.unsplash.com/photo-1661006117166-6227bfc9c8b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb29tbWF0ZXMlMjB0b2dldGhlciUyMGFwYXJ0bWVudHxlbnwxfHx8fDE3NzUxNzM0NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "#C87223",
  },
  {
    id: "3",
    title: "Divida as Despesas",
    description: "Calcule automaticamente quanto cada morador deve pagar.",
    image:
      "https://images.unsplash.com/photo-1649209979970-f01d950cc5ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxjdWxhdG9yJTIwYmlsbCUyMHNwbGl0dGluZ3xlbnwxfHx8fDE3NzUxNzM0NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "#1A4045",
  },
  {
    id: "4",
    title: "Acompanhe os Pagamentos",
    description: "Veja quem já pagou e quem ainda está devendo.",
    image:
      "https://images.unsplash.com/photo-1631540700964-6e292543024c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXltZW50JTIwc3RhdHVzJTIwY2hlY2tsaXN0fGVufDF8fHx8MTc3NTE3MzQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    color: "#C87223",
  },
];

export type OnboardingSlide = (typeof slides)[number];
