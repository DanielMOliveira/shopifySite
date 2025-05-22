[![Build Status](https://dev.azure.com/zippylosan/Devops/_apis/build/status%2Fshopifysite?branchName=dev)](https://dev.azure.com/zippylosan/Devops/_build/latest?definitionId=38&branchName=dev)
<sub>Click the badge to see details and the date/time of the last build</sub>

# Shopify Theme Dev Container & CI/CD

This repository provides a complete environment for developing, versioning, and deploying Shopify themes using Dev Containers, Docker, and Azure DevOps.

## Table of Contents
- [What's Included](#whats-included)
- [CI/CD Pipeline (Azure Pipelines)](#cicd-pipeline-azure-pipelines)
- [Quick Start Guide](#quick-start-guide)
- [Useful Shopify CLI Commands](#useful-shopify-cli-commands)
- [Best Practices](#best-practices)
- [How to Run Pipeline Steps Locally](#how-to-run-pipeline-steps-locally)
- [Questions?](#questions)

## What's Included
- **Standardized environment** with Dev Container (VS Code + Docker)
- **Automated CI/CD** via Azure Pipelines
- **Lint, Prettier, and Theme Check** to ensure code quality
- **Safe deploy** to staging and production environments

---

## CI/CD Pipeline (Azure Pipelines)
The pipeline runs automatically on every push to the `main` or `dev` branches and performs the following steps:

1. **Installs dependencies** (Node.js, Shopify CLI, linting tools)
2. **Checks formatting** with Prettier
3. **Runs ESLint** on JS files
4. **Runs Stylelint** on CSS files
5. **Runs Shopify Theme Check**
6. **Sets the theme ID** based on the branch (`main` = production, `dev` = staging)
7. **Pushes the theme** to the Shopify store
8. **Publishes the theme** (only if branch is `main` and variable `PUBLISH_THEME=true`)

---

## Quick Start Guide

### 1. Clone the repository
```bash
git clone <repository-URL> ~/shopifySite
cd ~/shopifySite
```
Open in VS Code:
```bash
code .
```

### 2. Open in Dev Container
In VS Code, press `Ctrl+Shift+P` and select **Dev Containers: Reopen in Container**.

### 3. Authenticate with Shopify
In the Dev Container terminal:
```bash
shopify theme dev --store <yourstore.myshopify.com>
```
Follow the link to authenticate in your browser.

### 4. Run locally
In the terminal, inside the theme folder:
```bash
shopify theme dev --store <yourstore.myshopify.com>
```
Go to [http://localhost:9292](http://localhost:9292) to preview.

### 5. Commit and push changes
```bash
git add .
git commit -m "Description of the change"
git push origin <branch>
```

---

## Useful Shopify CLI Commands

- List themes:
  ```bash
  shopify theme list --store <yourstore.myshopify.com>
  ```
- Download theme:
  ```bash
  shopify theme pull --store <yourstore.myshopify.com> --theme <THEME_ID>
  ```
- Logout:
  ```bash
  shopify auth logout
  ```
---

## Best Practices
- **Never publish directly to the live (active) theme.** Always use a development theme.
- **Always run lint, prettier, and theme check before pushing.**
- **Write clear commit messages.**
- **Check in the Shopify admin panel that the correct theme was updated.**
- **Use the Dev Container to ensure a standardized environment.**

---

### How to Run Pipeline Steps Locally

1. Install dependencies:
   ```bash
   npm install -g @shopify/cli @shopify/theme
   npm install --save-dev eslint stylelint stylelint-config-standard prettier @shopify/prettier-plugin-liquid
   ```
2. Check formatting:
   ```bash
   npx prettier --check "themes/<theme-name>/**/*.{liquid,js,css,json}"
   ```
3. Run ESLint:
   ```bash
   npx eslint "themes/<theme-name>/assets/*.js"
   ```
4. Run Stylelint:
   ```bash
   npx stylelint "themes/<theme-name>/assets/*.css"
   ```
5. Run Theme Check:
   ```bash
   cd themes/<theme-name>
   shopify theme check
   ```
6. Push the theme (make sure to use a development theme!):
   ```bash
   shopify theme push --store <yourstore.myshopify.com> --theme <THEME_ID> --password <TOKEN>
   ```
7. (Optional) Publish the theme (production):
   ```bash
   shopify theme publish --store <yourstore.myshopify.com> --theme <THEME_ID> --password <TOKEN>
   ```

---

## Questions?
Refer to this README whenever you need to review the workflow or main commands. For pipeline details, see the `azure-pipelines.yml` file.
