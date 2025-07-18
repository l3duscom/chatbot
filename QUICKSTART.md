# 🚀 Guia de Início Rápido - ChatBot IA

Este guia te ajudará a colocar o projeto funcionando em menos de 10 minutos.

## ⚡ Início Rápido

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env.local

# Configure as variáveis essenciais no .env.local:
DATABASE_URL="postgresql://username:password@localhost:5432/chatbot_ia"
NEXTAUTH_SECRET="sua-chave-secreta-muito-segura"
GEMINI_API_KEY="sua-api-key-do-gemini"
```

### 3. Configurar Banco de Dados
```bash
# Aplicar schema do banco
npm run db:push

# Inserir dados de exemplo
npm run db:seed
```

### 4. Executar o Projeto
```bash
npm run dev
```

🎉 **Pronto!** Acesse `http://localhost:3000`

## 🔑 Contas de Teste

Após executar o seed, você pode usar:

- **Admin**: admin@chatbot-ia.com / admin123
- **Demo**: demo@chatbot-ia.com / demo123

## 🛠️ Configuração Mínima

### Obtendo a API Key do Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API key
3. Adicione no `.env.local`:
```env
GEMINI_API_KEY="sua-api-key-aqui"
```

### Banco de Dados Local (PostgreSQL)

**Opção 1: Docker (Recomendado)**
```bash
docker run --name chatbot-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=chatbot_ia -p 5432:5432 -d postgres:15
```

**Opção 2: Instalação Local**
- Instale PostgreSQL
- Crie um banco chamado `chatbot_ia`
- Configure a URL de conexão

**Opção 3: Banco Online (Mais Fácil)**
- Use [Supabase](https://supabase.com) (gratuito)
- Ou [Railway](https://railway.app) (gratuito)
- Copie a URL de conexão para o `.env.local`

## 🧪 Testando o Sistema

### 1. Teste de Autenticação
1. Acesse `http://localhost:3000`
2. Clique em "Login"
3. Use as credenciais de teste
4. Deve redirecionar para o dashboard

### 2. Teste do Chatbot
1. No dashboard, acesse "Chatbots"
2. Clique no chatbot de demonstração
3. Teste uma conversa
4. Verifique as respostas da IA

### 3. Teste do Widget
1. Acesse `http://localhost:3000/demo`
2. Clique no ícone do chat
3. Teste uma conversa
4. Verifique a responsividade

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Gera build de produção
npm run start        # Inicia servidor de produção

# Banco de Dados
npm run db:push      # Aplica mudanças no schema
npm run db:migrate   # Executa migrações
npm run db:studio    # Abre interface do Prisma
npm run db:seed      # Insere dados de exemplo

# Qualidade de Código
npm run lint         # Verifica código
npm run type-check   # Verifica tipos TypeScript
```

## 🚨 Solução de Problemas

### Erro: "Database connection failed"
```bash
# Verifique se o PostgreSQL está rodando
docker ps

# Ou teste a conexão
psql -h localhost -p 5432 -U username -d chatbot_ia
```

### Erro: "Gemini API key invalid"
1. Verifique se a API key está correta
2. Confirme que a Gemini API está habilitada
3. Teste a key diretamente no [AI Studio](https://makersuite.google.com)

### Erro: "NextAuth configuration error"
```bash
# Gere uma nova chave secreta
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Adicione ao .env.local
NEXTAUTH_SECRET="sua-nova-chave-gerada"
```

### Erro: "Port 3000 is already in use"
```bash
# Mate o processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou use outra porta
npm run dev -- -p 3001
```

## 📱 Testando em Dispositivos Móveis

1. Encontre seu IP local:
```bash
ipconfig getifaddr en0  # Mac
ip addr show            # Linux
ipconfig               # Windows
```

2. Configure o NEXTAUTH_URL:
```env
NEXTAUTH_URL="http://seu-ip:3000"
```

3. Acesse `http://seu-ip:3000` no celular

## 🔄 Próximos Passos

1. **Customize o chatbot** - Edite o prompt e adicione conhecimento
2. **Configure integrações** - Conecte com APIs externas
3. **Personalize o design** - Ajuste cores e layout
4. **Configure analytics** - Monitore performance
5. **Deploy em produção** - Use Vercel, Railway ou Docker

## 🆘 Precisa de Ajuda?

- 📖 Leia o [README completo](README.md)
- 🐛 Reporte bugs nas [Issues](https://github.com/seu-usuario/chatbot-ia-saas/issues)
- 💬 Junte-se ao [Discord](https://discord.gg/chatbot-ia)
- 📧 Email: suporte@chatbot-ia.com

---

**Tempo estimado**: 5-10 minutos para setup completo

Feito com ❤️ para desenvolvedores 