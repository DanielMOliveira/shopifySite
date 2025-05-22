# Shopify Theme Dev Container & CI/CD

Este repositório fornece um ambiente completo para desenvolvimento, versionamento e deploy de temas Shopify, utilizando Dev Containers, Docker e Azure DevOps.

## Índice
- [O que está incluso](#o-que-está-incluso)
- [Pipeline CI/CD (Azure Pipelines)](#pipeline-cicd-azure-pipelines)
- [Guia rápido para iniciar o desenvolvimento](#guia-rápido-para-iniciar-o-desenvolvimento)
- [Comandos úteis do Shopify CLI](#comandos-úteis-do-shopify-cli)
- [Melhores práticas](#melhores-práticas)
- [Como rodar localmente os passos do pipeline](#como-rodar-localmente-os-passos-do-pipeline)
- [Dúvidas?](#dúvidas)

## O que está incluso
- **Ambiente padronizado** com Dev Container (VS Code + Docker)
- **CI/CD automatizado** via Azure Pipelines
- **Lint, Prettier e Theme Check** para garantir qualidade do código
- **Deploy seguro** para ambientes de staging e produção

---

## Pipeline CI/CD (Azure Pipelines)
O pipeline executa automaticamente, a cada push nos branches `main` ou `dev`, as seguintes etapas:

1. **Instala dependências** (Node.js, Shopify CLI, linting tools)
2. **Checa formatação** com Prettier
3. **Roda ESLint** nos arquivos JS
4. **Roda Stylelint** nos arquivos CSS
5. **Roda Shopify Theme Check**
6. **Define o ID do tema** conforme o branch (`main` = produção, `dev` = staging)
7. **Faz o push do tema** para a loja Shopify
8. **Publica o tema** (apenas se for branch `main` e variável `PUBLISH_THEME=true`)

---


## Guia rápido para iniciar o desenvolvimento

### 1. Clonar o repositório
```bash
git clone <URL-do-repositório> ~/shopifySite
cd ~/shopifySite
```
Abra no VS Code:
```bash
code .
```

### 2. Abrir no Dev Container
No VS Code, pressione `Ctrl+Shift+P` e selecione **Dev Containers: Reopen in Container**.

### 3. Autenticar no Shopify
No terminal do Dev Container:
```bash
shopify theme dev --store <sualoja.myshopify.com>
```
Siga o link para autenticar no navegador.

### 4. Rodar localmente
No terminal, dentro da pasta do tema:
```bash
shopify theme dev --store <sualoja.myshopify.com>
```
Acesse [http://localhost:9292](http://localhost:9292) para visualizar.

### 5. Versionar alterações
```bash
git add .
git commit -m "Descrição da alteração"
git push origin <branch>
```

---

## Comandos úteis do Shopify CLI

- Listar temas:
  ```bash
  shopify theme list --store <sualoja.myshopify.com>
  ```
- Baixar tema:
  ```bash
  shopify theme pull --store <sualoja.myshopify.com> --theme <ID_DO_TEMA>
  ```
- Limpar autenticação:
  ```bash
  shopify auth logout
  ```
---


## Melhores práticas
- **Nunca publique direto no tema ativo (live)**. Use sempre um tema de desenvolvimento.
- **Sempre rode lint, prettier e theme check antes do push**.
- **Descreva bem seus commits**.
- **Confirme no painel da Shopify se o tema correto foi atualizado**.
- **Use o Dev Container para garantir ambiente padronizado**.


--- 


### Como rodar localmente os passos do pipeline

1. Instale as dependências:
   ```bash
   npm install -g @shopify/cli @shopify/theme
   npm install --save-dev eslint stylelint stylelint-config-standard prettier @shopify/prettier-plugin-liquid
   ```
2. Cheque a formatação:
   ```bash
   npx prettier --check "themes/<nome-do-tema>/**/*.{liquid,js,css,json}"
   ```
3. Rode o ESLint:
   ```bash
   npx eslint "themes/<nome-do-tema>/assets/*.js"
   ```
4. Rode o Stylelint:
   ```bash
   npx stylelint "themes/<nome-do-tema>/assets/*.css"
   ```
5. Rode o Theme Check:
   ```bash
   cd themes/<nome-do-tema>
   shopify theme check
   ```
6. Faça o push do tema (atenção: use um tema de desenvolvimento!):
   ```bash
   shopify theme push --store <sualoja.myshopify.com> --theme <ID_DO_TEMA> --password <TOKEN>
   ```
7. (Opcional) Publique o tema (produção):
   ```bash
   shopify theme publish --store <sualoja.myshopify.com> --theme <ID_DO_TEMA> --password <TOKEN>
   ```

---

## Dúvidas?
Consulte este README sempre que precisar relembrar o fluxo ou comandos principais. Para detalhes do pipeline, veja o arquivo `azure-pipelines.yml`.
