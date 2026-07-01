# Life Dashboard

Painel pessoal para acompanhar habitos, sono, agua, passos, despesas e memoria diaria em uma interface simples, leve e responsiva.

[![Demo](https://img.shields.io/badge/Demo-online-2563EB?style=for-the-badge&logo=flydotio&logoColor=white)](https://meu-painel-pessoal.fly.dev/)
[![React](https://img.shields.io/badge/Frontend-React-111827?style=for-the-badge&logo=react&logoColor=61DAFB)](#stack)
[![Vite](https://img.shields.io/badge/Build-Vite-111827?style=for-the-badge&logo=vite&logoColor=646CFF)](#stack)
[![Docker](https://img.shields.io/badge/Deploy-Docker-111827?style=for-the-badge&logo=docker&logoColor=2496ED)](#deploy)

## Visao Geral

O Life Dashboard foi desenvolvido para reunir em um unico lugar informacoes que normalmente ficam espalhadas entre varios aplicativos, planilhas e anotacoes.

A ideia central do projeto e oferecer uma visao pessoal da rotina com acesso rapido, persistencia local e navegacao simples direto no navegador.

## O que o sistema faz

- registra habitos e progresso diario;
- acompanha agua, sono, passos e despesas;
- guarda memoria diaria;
- salva os dados no navegador;
- funciona sem login;
- pode ser executado localmente ou publicado com Docker e Fly.io.

## Stack

- React
- Vite
- Docker
- Nginx
- Fly.io
- armazenamento local no navegador

## Como rodar localmente

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Docker

```bash
docker build -t meu-painel-pessoal .
docker run --rm -p 8080:8080 meu-painel-pessoal
```

Depois acesse:

```text
http://localhost:8080
```

## Deploy

O projeto esta pronto para deploy com `Dockerfile` e `fly.toml`.

```bash
fly launch
fly deploy
```

## Estrutura principal

```text
life-dashboard/
  src/App.jsx
  src/main.jsx
  src/styles.css
  public/
  Dockerfile
  fly.toml
```

## Objetivo do projeto

Este projeto faz parte do meu portfolio como exemplo de dashboard pessoal e produto orientado a rotina. Ele foi desenvolvido para demonstrar:

- organizacao de informacao em interface compacta;
- experiencia de uso pessoal sem depender de backend;
- consistencia visual em painel de acompanhamento;
- deploy simples de uma aplicacao frontend containerizada.

## Demo

- Aplicacao online: https://meu-painel-pessoal.fly.dev/

## Repositorio

- Codigo: https://github.com/Cesare221/Life_control_dashboard

## Contato

- Portfolio: https://cesarddev.com.br/
- GitHub: https://github.com/Cesare221
- LinkedIn: https://linkedin.com/in/cdelmondes

Se este projeto fizer sentido para o seu contexto, fico a disposicao para conversar sobre dashboards, UX e organizacao de informacao.
