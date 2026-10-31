# Como publicar o site no GitHub Pages

Tempo estimado: 30 minutos, mais a espera do domínio (de minutos até 24 horas).

## 1. Criar o repositório

1. Entre em github.com (crie uma conta gratuita se ainda não tiver).
2. Clique em **New repository**.
3. Nome: `marquestavares-site`. Marque **Public**. Clique em **Create repository**.

## 2. Enviar os arquivos

1. Na página do repositório, clique em **uploading an existing file**.
2. Arraste **todos os arquivos desta pasta** (não a pasta em si): `index.html`, `casamento.html`, `inventario.html`, `divorcio.html`, `analise-pre-compra-de-imovel.html`, `style.css`, `favicon.svg`, `CNAME`, `robots.txt`, `sitemap.xml`, `_config.yml`, `COMO-ESCREVER-NO-BLOG.md` e as pastas `img`, `blog`, `_layouts` e `_posts` inteiras.
3. Clique em **Commit changes**.

## 3. Ligar o GitHub Pages

1. No repositório, vá em **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**; em **Branch**, escolha `main` e `/ (root)`. Salve.
3. Em **Custom domain**, confirme que aparece `marquestavares.com.br` (vem do arquivo CNAME).

## 4. Apontar o domínio (no Registro.br)

Entre em registro.br, abra o domínio `marquestavares.com.br` → **DNS** → **Editar zona** e crie:

| Tipo | Nome | Valor |
| --- | --- | --- |
| A | (em branco) | 185.199.108.153 |
| A | (em branco) | 185.199.109.153 |
| A | (em branco) | 185.199.110.153 |
| A | (em branco) | 185.199.111.153 |
| CNAME | www | SEU-USUARIO.github.io |

Troque `SEU-USUARIO` pelo seu nome de usuário do GitHub. Se o domínio estiver em outro provedor (Hostinger, GoDaddy etc.), os registros são os mesmos.

## 5. Ativar o cadeado (HTTPS)

Quando o GitHub confirmar o domínio em **Settings → Pages**, marque **Enforce HTTPS**.

## 6. Avisar o Google

1. Entre em search.google.com/search-console e adicione `marquestavares.com.br`.
2. Em **Sitemaps**, envie `sitemap.xml`.
3. Crie também o **Perfil da Empresa no Google** com o endereço do escritório e o link do site.

## Para alterar textos depois

No GitHub, abra o arquivo `.html`, clique no lápis (**Edit**), altere o texto entre as tags e clique em **Commit changes**. O site atualiza em 1 a 2 minutos.


## Para atualizar o site

No repositório, clique em **Add file → Upload files**, arraste os arquivos ou pastas que mudaram e clique em **Commit changes**. Arquivos com o mesmo nome são substituídos. Para escrever no blog, veja `COMO-ESCREVER-NO-BLOG.md`.
