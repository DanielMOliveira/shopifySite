# Clonando um Repositório Existente

Este tutorial assume que o repositório já contém o `Dockerfile`, `devcontainer.json` e o tema Shopify. Você irá clonar o repositório e continuar o desenvolvimento.

## 1. Clonar o Repositório
Clone o repositório do Azure DevOps para o seu sistema local:

```bash
git clone <URL-do-repositório> ~/shopifySite
cd ~/shopifySite
```
Substitua `<URL-do-repositório>` pelo URL do repositório (por exemplo, `https://dev.azure.com/<organização>/<projeto>/_git/shopify-theme`).

Abra o diretório no VS Code:
```bash
code .
```

## 2. Abrir o Dev Container
O repositório já contém `Dockerfile` e `.devcontainer/devcontainer.json`.
No VS Code, pressione `Ctrl+Shift+P`, digite e selecione **Dev Containers: Reopen in Container**.
O VS Code construirá a imagem Docker e iniciará o Dev Container. Isso pode levar alguns minutos na primeira vez.

## 3. Acessar o Terminal
Após o Dev Container iniciar, abra o terminal no VS Code (`Terminal > New Terminal` ou `Ctrl+\``).
Você estará no diretório de trabalho definido no Dockerfile (geralmente `/home/shopifydev/app` ou similar).

## 4. Aceder ao Shopify
Autentique-se na loja Shopify:
```bash
shopify theme dev --store jy1f5j-6g.myshopify.com
```
Copie a URL fornecida (por exemplo, `https://accounts.shopify.com/activate-with-code?device_code%5Buser_code%5D=XXXX-YYYY`), abra no navegador do seu computador, insira o código de verificação, faça login e autorize o CLI.

## 5. Listar os Temas e Ver Qual Está Ativo
Liste os temas da loja:
```bash
shopify theme list --store jy1f5j-6g.myshopify.com
```
Saída esperada:
```text
* 180539752831: Dawn (live)
  123456789012: Dawn (unpublished)
```
O tema com asterisco (`*`) é o ativo. Use um tema não publicado (por exemplo, `123456789012`) para desenvolvimento.

## 6. Verificar o Diretório do Tema
Confirme que o repositório clonado contém o tema Shopify:
```bash
ls -la
```
Você deve ver pastas como `layout/`, `sections/`, `templates/`, etc. Se o tema não estiver no diretório atual, navegue até ele (por exemplo, `cd my-theme`).

## 7. Correr Localmente para Testes
Inicie o servidor de desenvolvimento local:
```bash
shopify theme dev --store jy1f5j-6g.myshopify.com
```
Acesse [http://localhost:9292](http://localhost:9292) no navegador do seu computador.
Faça uma alteração de teste e verifique as alterações em [http://localhost:9292](http://localhost:9292). Pressione `Ctrl+C` para parar.

## 8. Fazer Alterações e Enviar para o Repositório
### Fazer o Push
Adicione as alterações, faça commit e push para o repositório:
```bash
git add .
git commit -m "Alteração de teste no tema"
git push origin master
```
Verifique no painel da Shopify (**Loja Virtual > Temas**) que o tema não publicado foi atualizado. O site ao vivo não será afetado.
