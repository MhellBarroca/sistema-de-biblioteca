# 📚 Sistema de Gestão de Biblioteca

Projeto desenvolvido como atividade prática da disciplina, implementando uma API REST com Next.js e frontend para consumo da API.

## 🚀 Como Rodar o Projeto

First, run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as **API routes** instead of React pages.

## 📋 Funcionalidades Implementadas

### Usuários
- Cadastro com nome, email e telefone (obrigatórios)
- Geração automática de ID único (UUID)
- Validação de email duplicado

### Livros
- Cadastro com título, autor, gênero e quantidade (obrigatórios)
- Geração automática de ID único (UUID)
- Campo `qtdEmprestados` iniciado com 0
- Validação de duplicidade por título + autor

### Empréstimos
- Verificação se usuário e livros existem
- Verificação de unidades disponíveis antes de emprestar
- Atualização automática do estoque

### Devoluções
- Localização do empréstimo ativo
- Atualização do estoque ao devolver
- Status atualizado para "concluído"

## 📁 Rotas da API

| Rota | Método | Descrição |
|---|---|---|
| /api/create/usuarios | POST | Cadastrar usuário |
| /api/create/livros | POST | Cadastrar livro |
| /api/list/usuarios | GET | Listar usuários |
| /api/list/livros | GET | Listar livros |
| /api/list/emprestimos | GET | Listar empréstimos |
| /api/emprestar | POST | Realizar empréstimo |
| /api/devolver | POST | Realizar devolução |

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).
