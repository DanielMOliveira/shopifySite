# Shopify Theme Dev Container

Ambiente de desenvolvimento para temas Shopify utilizando Dev Containers, Docker e integração com Azure DevOps.

Este projeto permite:
- Desenvolvimento local de temas Shopify com hot reload.
- Uso de Dev Containers para ambiente padronizado.
- Integração com Azure DevOps para versionamento e deploy.

## Comandos básicos do Shopify CLI

### Login
```bash
shopify theme dev --store jy1f5j-6g.myshopify.com
```

### Listar todos os temas
```bash
shopify theme list --store jy1f5j-6g.myshopify.com
```

### Limpar autenticação
```bash
shopify auth logout
```
