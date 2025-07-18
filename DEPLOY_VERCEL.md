# Deploy na Vercel - Guia Completo

## 🚀 Preparação para Deploy

### 1. **Configuração do Banco de Dados**

#### Opção A: Vercel Postgres (Recomendado)
```bash
# Instalar CLI da Vercel
npm i -g vercel

# Fazer login
vercel login

# Criar banco Postgres
vercel postgres create chatbot-ia-db
```

#### Opção B: Supabase (Alternativa)
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a `DATABASE_URL` das configurações

### 2. **Variáveis de Ambiente**

Na Vercel, configure estas variáveis:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="https://seu-app.vercel.app"
NEXTAUTH_SECRET="sua-chave-secreta-super-segura"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# Gemini API
GEMINI_API_KEY="sua-gemini-api-key"

# JWT
JWT_SECRET="sua-jwt-secret"

# App
NODE_ENV="production"
```

### 3. **Configuração do Build**

Certifique-se que o `package.json` tem:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "postbuild": "prisma generate"
  }
}
```

## 📦 Deploy Passo a Passo

### 1. **Preparar o Repositório**

```bash
# Adicionar todos os arquivos
git add .

# Commit das mudanças
git commit -m "Prepare for Vercel deployment"

# Push para GitHub
git push origin main
```

### 2. **Configurar na Vercel**

1. **Acesse**: [vercel.com](https://vercel.com)
2. **Importe** seu repositório do GitHub
3. **Configure** as variáveis de ambiente
4. **Deploy**!

### 3. **Configuração Avançada**

#### vercel.json (opcional)
```json
{
  "build": {
    "env": {
      "ENABLE_EXPERIMENTAL_COREPACK": "1"
    }
  },
  "functions": {
    "src/pages/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🔧 Problemas Comuns e Soluções

### 1. **Erro de Build - Prisma**
```bash
# Adicionar no package.json
"postbuild": "prisma generate && prisma db push"
```

### 2. **Erro de Timeout**
```json
// vercel.json
{
  "functions": {
    "src/pages/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 3. **Erro de Dependências**
```bash
# Limpar cache
npm ci
npm run build
```

### 4. **Erro de Environment Variables**
- Verifique se todas as variáveis estão configuradas
- Use `NEXTAUTH_URL` com a URL real da Vercel
- Não esqueça do `NEXTAUTH_SECRET`

## 🎯 Checklist de Deploy

### Antes do Deploy:
- [ ] `.gitignore` configurado
- [ ] Banco de dados criado
- [ ] Variáveis de ambiente definidas
- [ ] `package.json` com scripts corretos
- [ ] Código commitado no Git

### Durante o Deploy:
- [ ] Importar repositório na Vercel
- [ ] Configurar variáveis de ambiente
- [ ] Verificar configurações de build
- [ ] Fazer deploy

### Após o Deploy:
- [ ] Testar todas as funcionalidades
- [ ] Verificar autenticação
- [ ] Testar upload de CSV
- [ ] Verificar chat com IA
- [ ] Testar base de conhecimento

## 🔍 Verificação Pós-Deploy

### 1. **Teste de Funcionalidades**
```bash
# URLs para testar
https://seu-app.vercel.app/auth/signin
https://seu-app.vercel.app/chatbots/create
https://seu-app.vercel.app/debug-csv
```

### 2. **Monitoramento**
- **Vercel Dashboard**: Logs e métricas
- **Prisma Studio**: Verificar banco de dados
- **Browser DevTools**: Verificar erros frontend

### 3. **Performance**
- Lighthouse score
- Tempo de resposta da API
- Carregamento de páginas

## 📊 Estrutura Final

```
chatbot-ia/
├── .env.example          # Mantém no Git
├── .gitignore           # Novo arquivo criado
├── package.json         # Com scripts de build
├── vercel.json          # Configuração opcional
├── prisma/
│   └── schema.prisma    # Schema do banco
├── src/
│   ├── pages/
│   │   └── api/         # APIs para produção
│   └── components/      # Componentes React
└── public/              # Arquivos estáticos
```

## 🎉 Deploy Realizado!

Após seguir este guia, seu ChatBot IA estará rodando na Vercel com:

- ✅ **Autenticação** funcionando
- ✅ **Banco de dados** conectado
- ✅ **Upload de CSV** operacional
- ✅ **IA integrada** com base de conhecimento
- ✅ **Interface completa** para usuários
- ✅ **Performance otimizada** para produção

## 🔗 Links Úteis

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deploy](https://nextjs.org/docs/deployment)
- [Prisma Production](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deploy](https://next-auth.js.org/deployment)

**Pronto para produção!** 🚀 