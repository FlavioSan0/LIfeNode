# LifeNode

MVP pessoal para tarefas, agenda, projetos, clientes, areas e entrada rapida.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui local
- Prisma
- Neon PostgreSQL
- Auth.js/NextAuth com Credentials Provider
- bcryptjs para hash de senha
- Zod, React Hook Form e PWA

## Neon

1. Crie um projeto em Neon.
2. Copie a connection string pooled para `DATABASE_URL`.
3. Copie a connection string direta, sem pooler, para `DIRECT_URL`.
4. Mantenha `sslmode=require`.

Exemplo:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DB?sslmode=require&connect_timeout=15"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/DB?sslmode=require&connect_timeout=15"
AUTH_SECRET="gere-um-secret-forte"
AUTH_URL="http://localhost:3000"
SEED_USER_EMAIL="admin@lifenode.local"
SEED_USER_PASSWORD="senha-forte-aqui"
SEED_USER_NAME="Admin"
```

Gere um secret forte:

```bash
openssl rand -base64 32
```

## Setup local

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Abra `http://localhost:3000` e faca login com:

- E-mail: valor de `SEED_USER_EMAIL`
- Senha: valor de `SEED_USER_PASSWORD`

## Scripts uteis

```bash
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
npm run db:studio
```

## Deploy na Vercel

1. Crie o projeto na Vercel apontando para este repositorio.
2. Configure `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` e `AUTH_URL`.
3. Use `AUTH_URL` com a URL publica do app, por exemplo `https://lifenode.vercel.app`.
4. Rode a migration contra o Neon antes ou durante um deploy controlado.
5. Rode o seed somente quando quiser criar ou atualizar o usuario inicial.

## Seguranca

- Rotas internas sao protegidas no `src/proxy.ts`.
- Server Actions chamam `requireUser`.
- Queries e mutations filtram por `userId`.
- Senhas sao salvas apenas como hash bcrypt.
- Credenciais invalidas retornam erro generico.
- Variaveis sensiveis ficam fora do Git via `.env`.
- O schema esta preparado para isolamento por usuario e futura camada de politicas no banco.
