# Shopify Theme Dev Container

Ambiente de desenvolvimento para temas Shopify utilizando Dev Containers, Docker e integração com Azure DevOps.

Este projeto permite:
- Desenvolvimento local de temas Shopify com hot reload.
- Uso de Dev Containers para ambiente padronizado.
- Integração com Azure DevOps para versionamento e deploy.

## Comandos básicos do Shopify CLI

### Listar todos os temas
```bash
shopify theme list --store zippy-development.myshopify.com
```
### Baixar um tema
```bash
shopify theme pull --store zippy-development.myshopify.com --theme 180267843959
```
## Correr Localmente para Testes
Inicie o servidor de desenvolvimento local:
```bash
shopify theme dev --store zippy-development.myshopify.com
```

### Limpar autenticação
```bash
shopify auth logout
```
