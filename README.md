# Meu Painel Pessoal

Um painel de vida leve, visual e local para acompanhar hábitos, sono, água, passos, finanças e memórias diárias em um só lugar.

O progresso fica salvo no navegador de forma simples, sem login, para deixar o uso mais direto.

## Destaques

- Perfil com nome, sobrenome e altura
- Memória diária para acompanhar métricas com o passar do tempo
- Hábitos, água, sono, passos e despesas em uma interface compacta
- Tema com apoio à preferência do sistema
- Layout preparado para uso pessoal no navegador, Docker e Fly.io

## Live Demo:
https://meu-painel-pessoal.fly.dev

## Tecnologias

- React
- Vite
- Docker
- Nginx
- Fly.io

## Pré-requisitos

- Node.js 18+
- `flyctl` instalado e autenticado, se for publicar no Fly

## Configuração local

1. Instale as dependências.

```bash
npm install
```

2. Inicie o app.

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Docker

Build da imagem:

```bash
docker build -t meu-painel-pessoal .
```

Executando o container:

```bash
docker run --rm -p 8080:8080 meu-painel-pessoal
```

Depois acesse:

```bash
http://localhost:8080
```

## Fly.io

O projeto já está pronto para deploy com `fly.toml` e `Dockerfile`.

Fluxo recomendado:

```bash
fly launch
fly deploy
```

Se o app já existir, basta publicar novamente:

```bash
fly deploy
```

## Estrutura principal

- [`src/App.jsx`](./src/App.jsx) concentra os dados e o estado principal do painel
- [`src/styles.css`](./src/styles.css) controla a identidade visual e os ajustes responsivos
- [`public/logo-appicon.png`](./public/logo-appicon.png) é a logo usada no cabeçalho e no favicon
- [`background.png`](./background.png) é o background do projeto

## Observações

- Os dados ficam salvos no armazenamento do navegador.
- Se quiser, o próximo passo natural é adicionar exportação de dados ou histórico em CSV.
