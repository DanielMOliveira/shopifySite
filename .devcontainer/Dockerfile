FROM ubuntu:22.04

# Evita prompts de instalação
ENV DEBIAN_FRONTEND=noninteractive
ENV SHOPIFY_CLI_DEVICE_AUTH=1

# Instalar dependências básicas
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
    apt-get install -y nodejs && \
    apt-get remove -y libnode-dev || true

# Instalar Shopify CLI globalmente
RUN npm install -g @shopify/cli @shopify/theme

# Cria um usuário não-root
RUN useradd -ms /bin/bash shopifydev
USER shopifydev
WORKDIR /home/shopifydev/app

# Definir variáveis de ambiente para o Shopify CLI
ENV PATH="/home/shopifydev/.npm-global/bin:${PATH}"

# Configurar xdg-open vazio para autenticação manual
RUN mkdir -p /home/shopifydev/tmp-bin && \
    echo '#!/bin/sh' > /home/shopifydev/tmp-bin/xdg-open && \
    chmod +x /home/shopifydev/tmp-bin/xdg-open

# Adicionar tmp-bin ao PATH
ENV PATH="/home/shopifydev/tmp-bin:${PATH}"

# Expor a porta padrão do Shopify CLI (geralmente 9292 para tema local)
EXPOSE 9292
