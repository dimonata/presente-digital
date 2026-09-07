This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## E-mail transacional (Mailjet)

O envio após a compra usa a API transacional v3.1 do Mailjet. Crie e verifique um remetente ou domínio no Mailjet e configure estas variáveis no ambiente local e na hospedagem:

```env
MAILJET_API_KEY="sua-chave-pública"
MAILJET_SECRET_KEY="sua-chave-secreta"
EMAIL_FROM="presente@seu-dominio.com.br"
EMAIL_FROM_NAME="Letter Love"
APP_URL="https://seu-dominio.com.br"
```

Para boa entregabilidade, autentique no painel do Mailjet o mesmo domínio usado em `EMAIL_FROM` e configure os registros SPF e DKIM solicitados. As chaves devem ficar somente nas variáveis do servidor e nunca no código ou no navegador.

Cada e-mail inclui o link do presente, o QR Code, a capa correspondente ao modelo escolhido e uma arte JPG de 1080 × 1920 montada automaticamente com três fotos do usuário para publicação em Stories.

## Getting Started

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
