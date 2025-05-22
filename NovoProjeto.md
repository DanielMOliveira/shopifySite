# Tutorial 1: Criando um Novo Projeto do Zero

Este tutorial cobre a configuração inicial de um Dev Container no VS Code, a criação de um projeto Shopify, e os passos para baixar, testar e fazer push de um tema, começando do zero.

## 1. Instalar o Dev Container
**Pré-requisitos:**
- Instale o Visual Studio Code.
- Instale o Docker Desktop (certifique-se de que está em execução).
- Instale a extensão Dev Containers no VS Code:
  - Abra o VS Code, vá para Extensions (`Ctrl+Shift+X`), procure por "Dev Containers" (publicado pela Microsoft) e instale.

Verificar instalação:
```bash
docker --version
code --version
```
Confirme que o Docker e o VS Code estão instalados corretamente.

## 2. Criar o Diretório do Projeto
Crie um diretório para o projeto no seu sistema de arquivos:
```bash
mkdir ~/shopifySite
cd ~/shopifySite
```
Abra o diretório no VS Code:
```bash
code .
```

## 3. Criar o Dockerfile e o devcontainer.json
Crie o `Dockerfile` no diretório `~/shopifySite` com o seguinte conteúdo:

```dockerfile
FROM ubuntu:22.04

# Evita prompts interativos
ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependências
RUN apt-get update && apt-get install -y \
    curl \
    git \
    ruby-full \
    ruby-dev \
    build-essential \
    libffi-dev \
    libssl-dev \
    libreadline-dev \
    zlib1g-dev \
    libyaml-dev \
    libgdbm-dev \
    libncurses5-dev \
    libgmp-dev \
    libpq-dev \
    unzip \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Instalar Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Instalar Shopify CLI
RUN npm install -g @shopify/cli @shopify/theme

# Configurar xdg-open vazio para autenticação manual
RUN mkdir -p /home/shopifydev/tmp-bin && \
    echo '#!/bin/sh' > /home/shopifydev/tmp-bin/xdg-open && \
    chmod +x /home/shopifydev/tmp-bin/xdg-open

# Criar usuário não-root
RUN useradd -ms /bin/bash shopifydev
USER shopifydev
WORKDIR /home/shopifydev/app

# Adicionar tmp-bin ao PATH
ENV PATH="/home/shopifydev/tmp-bin:${PATH}"

# Expor porta do Shopify CLI
EXPOSE 9292
```

Crie o `.devcontainer/devcontainer.json` com o seguinte conteúdo:
```json
{
  "name": "Shopify Dev Environment",
  "build": {
    "dockerfile": "Dockerfile",
    "context": "."
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "Shopify.theme-check-vscode",
        "Shopify.shopify-liquid"
      ]
    }
  },
  "runArgs": [
    "--userns=host"
  ],
  "containerUser": "shopifydev",
  "updateRemoteUserUID": true,
  "postCreateCommand": "npm install",
  "portsAttributes": {
    "9292": {
      "label": "Shopify Dev Server",
      "onAutoForward": "notify"
    }
  },
  "forwardPorts": [
    9292
  ]
}
```

## 4. Fazer o Build do Dev Container
No VS Code, com o diretório `~/shopifySite` aberto, pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac) para abrir a paleta de comandos.
Digite e selecione **Dev Containers: Reopen in Container**.
O VS Code construirá a imagem Docker a partir do Dockerfile e iniciará o Dev Container. Isso pode levar alguns minutos na primeira vez.

## 5. Acessar o Terminal
Após o Dev Container iniciar, abra o terminal no VS Code:
Clique em `Terminal > New Terminal` ou pressione `Ctrl+\`` (backtick).
Você estará no diretório `/home/shopifydev/app` como o usuário `shopifydev`.

## 6. Aceder ao Shopify
Autentique-se na loja Shopify:
```bash
shopify theme dev --store jy1f5j-6g.myshopify.com
```
O comando exibirá uma URL (por exemplo, `https://accounts.shopify.com/activate-with-code?device_code%5Buser_code%5D=XXXX-YYYY`) e um código de verificação (por exemplo, `XXXX-YYYY`).
Copie a URL, abra-a no navegador do seu computador (fora do contêiner), insira o código, faça login na sua conta Shopify e autorize o CLI.

## 7. Listar os Temas e Ver Qual Está Ativo
Liste os temas disponíveis na loja:
```bash
shopify theme list --store jy1f5j-6g.myshopify.com
```
Saída esperada:
```text
* 180539752831: Dawn (live)
  123456789012: Dawn (unpublished)
```
O tema com asterisco (`*`) é o ativo (live). Temas sem asterisco são não publicados (use um desses para desenvolvimento).

## 8. Criar um Diretório e Baixar um Tema de Desenvolvimento
Crie um diretório para o tema:
```bash
mkdir my-theme
cd my-theme
```
Baixe um tema não publicado (por exemplo, ID `123456789012`):
```bash
shopify theme pull --store jy1f5j-6g.myshopify.com --theme 123456789012
```
Isso criará a estrutura do tema (com pastas como `layout/`, `sections/`, etc.) no diretório `my-theme`.

## 9. Iniciar o Git
Inicialize um repositório Git no diretório do tema:
```bash
git init
```
Crie um `.gitignore` para evitar versionar arquivos sensíveis:
```bash
echo -e "config/settings_data.json\nconfig/settings_schema.json\n.shopifyignore" > .gitignore
```
Adicione os arquivos, faça commit e conecte ao repositório remoto (substitua `<URL-do-repositório>` pelo URL do seu repositório no Azure DevOps):
```bash
git add .
git commit -m "Inicializar tema Shopify"
git remote add origin <URL-do-repositório>
git branch -M master
git push -u origin master
```

## 10. Correr Localmente para Testes
Inicie o servidor de desenvolvimento local:
```bash
shopify theme dev --store jy1f5j-6g.myshopify.com
```
Acesse [http://localhost:9292](http://localhost:9292) no navegador do seu computador para visualizar o tema.
Faça uma alteração de teste e verifique as alterações em [http://localhost:9292](http://localhost:9292). Pressione `Ctrl+C` para parar o servidor.

## 11. Fazer o Push
Adicione as alterações, faça commit e push para o repositório:
```bash
git add .
git commit -m "Alteração de teste no tema"
git push origin master
```
Para fazer push do tema para a loja Shopify (tema não publicado):
```bash
shopify theme push --store jy1f5j-6g.myshopify.com --theme 123456789012 --allow-live
```
Verifique no painel da Shopify (**Loja Virtual > Temas**) que o tema não publicado foi atualizado. O site ao vivo não será afetado.

## 12. Conclusão
Parabéns! Você configurou um ambiente de desenvolvimento Shopify com Dev Containers no VS Code, baixou um tema, fez alterações e fez push para o repositório remoto e para a loja Shopify. Agora você pode continuar desenvolvendo seu tema com facilidade.

---

> **Nota:** Este tutorial é uma introdução básica. Para mais informações sobre o Shopify CLI, consulte a [documentação oficial](https://shopify.dev/themes/tools/cli).
