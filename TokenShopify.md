# Passo a Passo: Gerar Token no Shopify e Associar ao Azure DevOps

1. **Acessar o Painel da Shopify**
   - Abra o navegador e faça login no painel de administração da sua loja Shopify:
     - URL: https://jy1f5j-6g.myshopify.com/admin
   - Use suas credenciais de administrador da loja. Certifique-se de que sua conta tem permissões para Temas e Aplicativos e canais de vendas (verifique em Configurações > Usuários e permissões).

2. **Criar um Aplicativo Privado**
   - No painel da Shopify, vá para **Configurações > Aplicativos e canais de vendas**.
   - Clique em **Desenvolver aplicativos** (no topo da página).
   - Clique no botão **Criar aplicativo**.
   - Dê um nome ao aplicativo, por exemplo: `Azure DevOps Deploy`.
   - Opcional: Adicione uma descrição, como "Aplicativo para deploy de temas via Azure DevOps".

3. **Configurar Permissões do Aplicativo**
   - Na seção Permissões de acesso ao administrador, clique em **Configurar**.
   - Habilite a permissão **Temas - Ler e escrever** (isso permite que o aplicativo acesse e modifique temas).
   - **Nota:** Não habilite permissões desnecessárias para manter a segurança.
   - Salve as alterações.

4. **Instalar o Aplicativo**
   - Após configurar as permissões, clique em **Instalar aplicativo**.
   - Confirme a instalação quando solicitado. Isso gerará o Theme Access token.
   - **Importante:** O token será exibido apenas uma vez, então copie-o imediatamente.

5. **Copiar o Theme Access Token**
   - O token será um valor começando com `shpat_` (por exemplo, `shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`).
   - Copie o token e salve-o em um local seguro (por exemplo, um gerenciador de senhas). **Não compartilhe o token publicamente.**
   - **Nota:** Se você perder o token, será necessário criar um novo aplicativo, pois o Shopify não permite visualizar tokens existentes.
