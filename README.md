# ChatBot IA - SaaS de Chatbots Inteligentes

Uma plataforma completa para criação de chatbots inteligentes com IA, usando Next.js, PostgreSQL, Prisma, Gemini AI e integração com APIs externas para base de conhecimento.

## 🚀 Características

- **IA Avançada**: Powered by Google Gemini para conversas naturais
- **Base de Conhecimento**: Integração com APIs externas e base interna
- **Autenticação**: Sistema completo com NextAuth.js
- **Dashboard**: Interface completa para gerenciamento
- **Widget Embarcável**: Adicione em qualquer site
- **Analytics**: Métricas detalhadas e insights
- **Treinamento**: IA aprende com conversas
- **Responsivo**: Interface otimizada para todos os dispositivos

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: PostgreSQL
- **Autenticação**: NextAuth.js
- **IA**: Google Gemini API
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Notificações**: React Hot Toast

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- API Key do Google Gemini
- (Opcional) Redis para cache

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/chatbot-ia-saas.git
cd chatbot-ia-saas
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env.local
```

Edite `.env.local` com suas configurações:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/chatbot_ia"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# Gemini API
GEMINI_API_KEY="sua-gemini-api-key"

# JWT
JWT_SECRET="sua-jwt-secret"

# External Knowledge Base API
KNOWLEDGE_BASE_API_URL="https://api.exemplo.com"
KNOWLEDGE_BASE_API_KEY="sua-api-key"
```

4. **Configure o banco de dados**
```bash
# Executar migrações
npm run db:push

# Executar seed (dados de exemplo)
npm run db:seed
```

5. **Execute o projeto**
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 📚 Uso

### Contas de Demonstração

Após executar o seed, você terá acesso a:

- **Admin**: admin@chatbot-ia.com (senha: admin123)
- **Demo**: demo@chatbot-ia.com (senha: demo123)

### Criando seu Primeiro Chatbot

1. Faça login na plataforma
2. Acesse o Dashboard
3. Clique em "Criar Chatbot"
4. Configure o prompt do sistema
5. Adicione itens à base de conhecimento
6. Teste o chatbot
7. Obtenha o código do widget para incorporar

### Widget Embarcável

Para incorporar o chatbot em seu site:

```html
<!-- Inclua o React (se não estiver já incluído) -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- Inclua o script do widget -->
<script src="https://seu-dominio.com/widget.js"></script>

<!-- Inicialize o widget -->
<script>
  ChatbotWidget.init({
    chatbotId: 'seu-chatbot-id',
    position: 'bottom-right',
    theme: 'auto',
    primaryColor: '#3b82f6',
    headerTitle: 'Assistente',
    headerSubtitle: 'Online',
    showBranding: true
  });
</script>
```

### API Endpoints

#### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

#### Chatbots
- `GET /api/chatbots` - Listar chatbots
- `POST /api/chatbots` - Criar chatbot
- `PUT /api/chatbots/[id]` - Atualizar chatbot
- `DELETE /api/chatbots/[id]` - Deletar chatbot

#### Chat
- `POST /api/chat/[chatbotId]` - Enviar mensagem

#### Base de Conhecimento
- `GET /api/knowledge-base?chatbotId=[id]` - Listar conhecimento
- `POST /api/knowledge-base` - Adicionar conhecimento
- `PUT /api/knowledge-base/[id]` - Atualizar conhecimento
- `DELETE /api/knowledge-base/[id]` - Deletar conhecimento

## 🔐 Autenticação

O sistema suporta:
- **Credenciais**: Email e senha
- **Google OAuth**: Login com Google
- **JWT**: Tokens seguros para API

## 🧠 Integração com IA

### Gemini API

Configure sua API key do Google Gemini:
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API key
3. Adicione a key no arquivo `.env.local`

### Funcionalidades da IA

- **Geração de Respostas**: Respostas contextuais inteligentes
- **Análise de Intenções**: Identifica intenções do usuário
- **Sugestões**: Gera sugestões de respostas rápidas
- **Resumos**: Cria resumos de conversas
- **Streaming**: Respostas em tempo real

## 📊 Analytics

O sistema coleta métricas sobre:
- Número de conversas
- Mensagens enviadas/recebidas
- Tempo de resposta
- Satisfação do usuário
- Consultas à base de conhecimento

## 🔧 Configuração Avançada

### Cache com Redis

Para melhor performance, configure Redis:

```env
REDIS_URL="redis://localhost:6379"
```

### Email (Notificações)

Configure SMTP para notificações:

```env
EMAIL_FROM="noreply@seudominio.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASSWORD="sua-senha-app"
```

### Webhooks

Configure webhooks para integrações:

```javascript
// Exemplo de webhook
app.post('/webhook', (req, res) => {
  const { event, data } = req.body;
  
  switch(event) {
    case 'message.sent':
      // Processar mensagem enviada
      break;
    case 'conversation.started':
      // Processar nova conversa
      break;
  }
  
  res.status(200).json({ success: true });
});
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Banco de Dados em Produção

Para produção, use um banco PostgreSQL gerenciado:
- **Supabase**: Gratuito até 2GB
- **PlanetScale**: MySQL compatível
- **Railway**: PostgreSQL simples
- **AWS RDS**: Para aplicações enterprise

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run db:push` - Aplica mudanças no banco
- `npm run db:migrate` - Executa migrações
- `npm run db:studio` - Abre o Prisma Studio
- `npm run db:seed` - Executa seed do banco

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Documentação**: [docs.chatbot-ia.com](https://docs.chatbot-ia.com)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/chatbot-ia-saas/issues)
- **Discord**: [Comunidade Discord](https://discord.gg/chatbot-ia)
- **Email**: suporte@chatbot-ia.com

## 🗺️ Roadmap

- [ ] Integração com WhatsApp
- [ ] Integração com Telegram
- [ ] Integração com Discord
- [ ] Suporte a múltiplos idiomas
- [ ] Análise de sentimento
- [ ] Integração com CRM
- [ ] Templates de chatbot
- [ ] Marketplace de plugins
- [ ] API pública completa
- [ ] Modo white-label

## 👥 Equipe

- **Desenvolvedor Principal**: [Seu Nome](https://github.com/seu-usuario)
- **Contribuidores**: [Lista de Contribuidores](https://github.com/seu-usuario/chatbot-ia-saas/contributors)

## 📈 Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

---

Feito com ❤️ e Next.js 