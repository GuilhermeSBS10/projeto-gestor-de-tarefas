---
version: alpha
colors:
  action: "#1d4ed8"
  ink: "#0f172a"
  muted: "#64748b"
  line: "#e2e8f0"
  surface: "#ffffff"
  canvas: "#f6f7fb"
  success: "#16a34a"
  warning: "#d97706"
typography:
  interface:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
  data:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
rounded:
  control: "0.65rem"
  panel: "0.85rem"
spacing:
  panel: "1.25rem"
components:
  dashboard-panel:
    backgroundColor: "#ffffff"
    borderColor: "#e2e8f0"
  primary-action:
    backgroundColor: "#1d4ed8"
    textColor: "#ffffff"
---

## Overview

TaskFlow é um espaço operacional para uma equipe financeira pequena. Sua referência visual é uma sala de controle bem organizada: contida, factual e rápida de ler. A assinatura é a visualização precisa de dados com rótulos diretos. Nunca deve parecer um template promocional de SaaS, usar gradientes decorativos ou repetir grandes gráficos de rosca.

O CSS e a configuração Tailwind continuam canônicos; este documento espelha os valores aceitos e registra sua finalidade.

## Colors

Azul é reservado para ações primárias e informação ativa. Verde, âmbar e vermelho mantêm significado semântico. Painéis estáticos são brancos com divisórias slate; o modo escuro remapeia superfícies sem alterar a hierarquia.

## Typography

Textos usam a pilha Inter/system existente. Números operacionais usam fonte monoespaçada e algarismos tabulares para manter comparações estáveis.

## Layout

O dashboard segue uma grade densa e responsiva. Métricas relacionadas dividem uma única faixa, em vez de flutuarem em cartões independentes. Painéis usam 20px de espaço interno e colapsam para uma coluna em telas estreitas.

O login usa uma composição dividida em desktop: fotografia editorial do trabalho real à esquerda e formulário em superfície navy à direita. Em telas estreitas, a fotografia sai de cena para preservar foco, espaço e velocidade. A autenticação usa o mesmo azul de ação do produto e não introduz uma paleta promocional paralela.

## Elevation & Depth

Conteúdo estático é quase plano: borda de um pixel e sombra mínima. Elevação fica reservada a overlays e navegação ativa.

## Shapes

Painéis usam raio controlado de 13–14px; controles, cerca de 10px. Pílulas ficam restritas a indicadores compactos de status ou tendência.

## Components

Gráficos são SVG/CSS nativos, usam rótulos diretos, possuem nomes acessíveis e não dependem apenas da cor quando exibem valores. As métricas do dashboard usam uma faixa única com divisórias. O foco é visível na família de azul da ação.

## Do's and Don'ts

- Use rótulos concisos em português, números reais e datas claras.
- Use cor com moderação para destacar status e ação.
- Preserve layouts móveis utilizáveis e contraste no modo escuro.
- Não adicione ilustrações decorativas em páginas operacionais.
- Não use gradientes decorativos, vidro, arredondamento excessivo ou donuts repetidos.
- Não anime dados sem explicar uma mudança real de estado.
