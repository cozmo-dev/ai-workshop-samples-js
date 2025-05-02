# Imersão Cozmo

Boas vindas à imersão Cozmo! Este repositório contém notebooks usados como
referência durante a imersão.

## Codespaces

Recomenda-se a utilização do
[GitHub Codespaces](https://docs.github.com/en/codespaces/developing-in-a-codespace/creating-a-codespace-from-a-template)
para realizar as atividades do workshop. O processo é bem simples:

1. Clique no botão `Use This Template` para clonar o repositório;
   1. Defina um nome para o seu repositório;
   2. Selecione a opção "Privado" para esconder o repositório do público em
      geral;
2. No seu repositório, aperte o botão `Code`
   1. Selecione a aba `Codespaces`
   2. Clique no botão `Create codespace on main`
3. Pronto! Uma instância do Visual Studio Code deve abrir no seu navegador.

Todas as dependências necessárias para executar os notebooks são instaladas
automaticamente.

> As dependências podem demorar para instalar. Aguarde alguns segundos caso
> tenha problemas para executar um notebook!

### Configure os secrets

Para que você não precise digitar suas chaves de API todas as vezes que for
executar um notebook, recomendamos que você configure-as como um secret do seu
codespace.

1. No canto superior direito de qualquer página no GitHub, clique na sua foto de
   perfil e depois em `Settings`.
2. Na seção `Code, planning, and automation` da barra lateral, clique em
   `Codespaces`.
3. À direita de `Codespaces secrets`, clique em `New secret`.
4. Em `Name`, digite o nome para seu segredo (variável de ambiente).
5. Em `Value`, digite o valor do seu segredo.
6. Selecione o menu suspenso `Repository access` e selecione este repositório.
7. Clique em `Add Secret`

Pronto! O segredo do ambiente de desenvolvimento é exportado como uma variável
de ambiente para a sua sessão do Codespaces.
