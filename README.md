# Analisador de Produtividade de Emails
Uma aplicação full-stack que utiliza a API Generativa da Google (Gemini) para classificar emails como "Produtivos" ou "Improdutivos", extrair informações chave e sugerir respostas.

## Funcionalidades
* Classificação Inteligente: Distingue entre emails de trabalho importantes e distrações (marketing, spam).
* Extração de Informações: Identifica e extrai perguntas, datas/prazos e ações de emails produtivos.
* Sugestão de Respostas: Gera respostas automáticas e contextuais com base na classificação do email.
* Interface Flexível: Suporta tanto o upload de arquivos (.txt, .pdf) quanto a inserção direta de texto.

## Tech Stack:
* Backend: Python, Flask, Google Gemini API, Docker
* Frontend: React, TypeScript, Vite, TailwindCSS, Shadcn/ui
* Infra: Render para deploy

## Pré-requisitos
Antes de começar, certifique-se de que você tem as seguintes ferramentas instaladas em sua máquina:
* Git
* Node.js (v18 ou superior)
* Docker e Docker Compose
* Uma chave

## Rodando o Projeto Localmente
Siga os passos abaixo para executar a aplicação em seu ambiente de desenvolvimento.

### 1. Clonar o Repositório
Primeiro, clone este repositório para a sua máquina local:
```bash
git clone https://github.com/Guga2111/email-classification-autoU.git
cd email-classification-autoU
```

### 2. Configurar Backend
O backend roda dentro de um contêiner Docker para garantir um ambiente consistente.

#### 1. Navegue até a pasta do backend:
```bash
cd backend
```

#### 2. Crie o arquivo de ambiente:
```bash
# No Windows (PowerShell)
New-Item .env

# No macOS/Linux
touch .env
```

#### 3. Abra o arquivo .env e adicione a seguinte linha, substituindo SUA_CHAVE_API_AQUI pela sua chave da API do Gemini:
```bash
GEMINI_API_KEY=SUA_CHAVE_API_AQUI
```

#### 4. Construa a imagem Docker:
Este comando cria uma imagem do Docker chamada autou-backend com base nas instruções do Dockerfile.
```bash
docker build -t autou-backend .
```

#### 5. Execute o contêiner Docker:
Este comando inicia o contêiner em segundo plano (-d), mapeia a porta 5001 do seu computador para a porta 5000 do contêiner (-p), e carrega as variáveis de ambiente do arquivo .env.

```bash
docker run -d -p 5001:5000 --env-file .env autou-backend
```
Para verificar se o contêiner está rodando, você pode usar o comando docker ps.

### 3. Configurar o Frontend
Com o backend rodando, abra um novo terminal para configurar e iniciar a interface.

#### 1. Navegue até a pasta do frontend: (A partir da pasta raiz do projeto)
```bash
cd frontend
```

#### 2. Instale as dependências:
Este comando lê o arquivo package.json e instala todas as bibliotecas necessárias para o projeto React.
```bash
npm install
```

#### 3. Execute a aplicação:
Este comando inicia o servidor de desenvolvimento do Vite.
```bash
npm run dev
```

## Acesso à Aplicação
Após seguir todos os passos, a aplicação estará disponível nos seguintes endereços:
* Frontend (Interface Web): Abra seu navegador e acesse http://localhost:5173 (ou a porta indicada no seu terminal).
* Backend (API): A API estará escutando em http://localhost:5001.
