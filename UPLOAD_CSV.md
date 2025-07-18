# Funcionalidade de Upload CSV

## Descrição
A funcionalidade de upload CSV permite que você adicione uma base de conhecimento aos seus chatbots através de arquivos CSV. O sistema suporta dois formatos diferentes:

1. **Formato Base de Conhecimento (Novo)**: Para documentos estruturados com tags e metadados
2. **Formato FAQ (Antigo)**: Para perguntas e respostas simples

## Instalação das Dependências

Para usar a funcionalidade de upload CSV, você precisa instalar as seguintes dependências:

```bash
npm install formidable papaparse
npm install --save-dev @types/formidable @types/papaparse
```

## Formatos de CSV Suportados

### 1. Formato Base de Conhecimento (Novo)

O novo formato usa **ponto e vírgula (;)** como separador e contém as seguintes colunas:

- **idpasta**: ID da pasta de organização
- **pasta**: Nome da pasta (pode estar vazio)
- **idconhecimento**: ID único do conhecimento
- **titulo**: Título do documento/conhecimento
- **tipodocumento**: Tipo do documento (ex: "D" para documento)
- **conteudosemformatacao**: Conteúdo em texto puro
- **conteudo**: Conteúdo com formatação HTML
- **tags**: Tags separadas por vírgulas

#### Exemplo de CSV (Novo Formato):

```csv
idpasta;pasta;idconhecimento;titulo;tipodocumento;conteudosemformatacao;conteudo;tags
983;;3991;Hardware - Computador - RAT de Atendimento;D;Modelo de RAT de atendimento de Computador.;<p>Modelo de RAT de atendimento de Computador.</p>;hardware,computador,rat,atendimento
983;;2305;Hardware - Impressora - ADF Atolando;D;Executar verificações do script em anexo.;<p>Executar verificações do script em anexo.</p>;hardware,impressora,adf
983;;2308;Hardware - Impressora - Buffer overflow;D;Executar verificações do script em anexo.;<p>Executar verificações do script em anexo.</p>;hardware,impressora,buffer-overflow
```

### 2. Formato FAQ (Antigo)

O formato antigo usa **vírgula (,)** como separador e contém as seguintes colunas:

- **pergunta** (ou **question**): A pergunta do usuário
- **resposta** (ou **answer**): A resposta que o chatbot deve dar

#### Exemplo de CSV (Formato Antigo):

```csv
pergunta,resposta
"Qual é o horário de funcionamento?","Funcionamos de segunda a sexta das 9h às 18h"
"Como posso cancelar meu pedido?","Você pode cancelar seu pedido até 24h após a compra"
"Quais são as formas de pagamento?","Aceitamos cartão de crédito, débito e PIX"
```

## Como Usar

1. **Crie um novo chatbot** na página de criação
2. **Após criar o chatbot**, aparecerá automaticamente uma seção para upload da base de conhecimento
3. **Prepare seu arquivo CSV** em um dos formatos suportados
4. **Faça o upload do arquivo CSV** arrastando e soltando ou clicando para selecionar
5. **Aguarde o processamento** - o sistema irá detectar automaticamente o formato e importar os dados
6. **Finalize** - seu chatbot agora terá conhecimento baseado no CSV

## Limitações

- Tamanho máximo do arquivo: **5MB**
- Formato suportado: **CSV** apenas
- Codificação: **UTF-8**
- Separadores aceitos: **vírgula (,)** para formato antigo, **ponto e vírgula (;)** para formato novo

## Integração com o Chat

A base de conhecimento é automaticamente integrada ao sistema de chat. Quando um usuário faz uma pergunta, o chatbot:

1. Consulta a base de conhecimento
2. Inclui informações relevantes no contexto
3. Utiliza tags e metadados para melhor correspondência
4. Gera uma resposta personalizada usando IA

## APIs Disponíveis

- `POST /api/chatbots/[id]/upload-csv` - Upload de arquivo CSV
- `GET /api/chatbots/[id]/knowledge-base` - Listar base de conhecimento
- `DELETE /api/chatbots/[id]/knowledge-base` - Limpar base de conhecimento

## Estrutura dos Dados

### Formato Novo (Base de Conhecimento)
Os dados são armazenados na tabela `knowledge_base` com:

```typescript
{
  id: string
  title: string           // Título do documento
  content: string         // Conteúdo sem formatação
  type: "DOCUMENT"
  source: string          // Nome do arquivo CSV
  metadata: {
    rowIndex: number
    idpasta: string
    pasta: string
    idconhecimento: string
    tipodocumento: string
    conteudoFormatado: string
    tags: string[]
    uploadedAt: string
  }
  chatbotId: string
}
```

### Formato Antigo (FAQ)
```typescript
{
  id: string
  title: string           // "FAQ 1", "FAQ 2", etc.
  content: string         // "Pergunta: ...\nResposta: ..."
  type: "FAQ"
  source: string          // Nome do arquivo CSV
  metadata: {
    rowIndex: number
    question: string
    answer: string
    uploadedAt: string
  }
  chatbotId: string
}
```

## Exemplo de Uso Completo

### Usando o Novo Formato

1. **Prepare seu CSV:**
   ```csv
   idpasta;pasta;idconhecimento;titulo;tipodocumento;conteudosemformatacao;conteudo;tags
   1;;100;Política de Privacidade;D;Nossa política de privacidade protege seus dados.;<p>Nossa política de privacidade protege seus dados.</p>;privacidade,dados,lgpd
   1;;101;Termos de Uso;D;Termos e condições de uso da plataforma.;<p>Termos e condições de uso da plataforma.</p>;termos,condições,uso
   ```

2. **Crie o chatbot** na interface
3. **Upload o arquivo** na seção que aparece
4. **Teste o chatbot** - ele agora responderá com base no CSV

### Usando o Formato Antigo

1. **Prepare seu CSV:**
   ```csv
   pergunta,resposta
   "Horário de funcionamento?","9h às 18h, segunda a sexta"
   "Como fazer pedido?","Acesse nosso site e clique em 'Fazer Pedido'"
   ```

2. **Crie o chatbot** na interface
3. **Upload o arquivo** na seção que aparece
4. **Teste o chatbot** - ele agora responderá com base no CSV

## Dicas

- **Novo formato**: Use tags para melhor categorização e busca
- **Novo formato**: Utilize o campo "conteudosemformatacao" para texto limpo
- **Novo formato**: O campo "conteudo" pode conter HTML para formatação
- **Ambos os formatos**: Use linguagem natural
- **Ambos os formatos**: Respostas devem ser claras e completas
- **Ambos os formatos**: Teste sempre após o upload
- **Ambos os formatos**: Você pode fazer múltiplos uploads (dados são adicionados)

## Troubleshooting

**Erro "Dependências não instaladas":**
```bash
npm install formidable papaparse @types/formidable @types/papaparse
```

**Erro "Formato de CSV não reconhecido":**
- Verifique se está usando o separador correto (`;` para novo formato, `,` para antigo)
- Confirme se as colunas obrigatórias estão presentes
- Novo formato: `idconhecimento`, `titulo`, `conteudo`, `tags`
- Formato antigo: `pergunta`/`question` e `resposta`/`answer`

**Arquivo muito grande:**
- Divida o CSV em arquivos menores (< 5MB cada)
- Remova colunas desnecessárias

**Problemas de codificação:**
- Salve o CSV em UTF-8
- Evite caracteres especiais problemáticos

**Problemas com separadores:**
- Novo formato: Use ponto e vírgula (;)
- Formato antigo: Use vírgula (,)
- Não misture separadores no mesmo arquivo 