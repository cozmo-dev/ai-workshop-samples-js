
//#nbts@mark
// # Interagindo com um LLM
// 
// Neste notebook, vamos aprender a interagir com um LLM usando o framework [LangChain](https://js.langchain.com/) e os modelos da [OpenAI](https://platform.openai.com/docs/api-reference/chat). Ao final deste tutorial, você entenderá:
// 
// - O que são LLMs
// - Por que usaremos a OpenAI durante a imersão
// - Como obter uma chave de API da OpenAI
// - Como configurar seu ambiente
// - Como usar o LangChain para interagir com os modelos da OpenAI
//#nbts@mark
// ## 1. Introdução
//#nbts@mark
// ### O que são LLMs?
// 
// Grandes Modelos de Linguagem (LLMs) são sistemas de IA treinados em vastas quantidades de dados textuais que podem entender e gerar texto semelhante ao humano. Eles podem realizar uma ampla gama de tarefas, desde responder perguntas e resumir conteúdo até escrever código e textos criativos.
//#nbts@mark
// ### Por que usar a OpenAI?
// 
// Estamos usando modelos da OpenAI por várias razões. Entretanto, destacamos dois motivos principais:
// 
// 1. **Documentação**: A OpenAI possui documentação e exemplos extensos, facilitando o aprendizado.
// 
// 2. **Padronização**: a API da OpenAI se tornou o padrão para interagir com modelos de chat. Soluções como o [LiteLLM](https://docs.litellm.ai/docs/providers/litellm_proxy) permitem que você interaja com provedores de LLM através de uma interface unificada e compatível com os endpoints da OpenAI. Além disso, provedores como [Anthropic](https://docs.anthropic.com/en/api/openai-sdk), [Ollama](https://ollama.com/blog/openai-compatibility) e [DeepSeek](https://api-docs.deepseek.com/) fornecem APIs oficiais compatíveis a OpenAI. Em outras palavras: se você sabe usar OpenAI, você consegue usar qualquer outro provedor relevante com o mínimo esforço.
//#nbts@mark
// ### O que é LangChain?
// 
// LangChain é um framework projetado para simplificar o desenvolvimento de aplicações que usam LLMs. Ele fornece ferramentas para:
// 
// - Gerenciar prompts.
// - Encadear múltiplas chamadas de LLM.
// - Facilitar a integração com fontes de dados externas.
// - Construir agentes que podem usar ferramentas e tomar decisões.
// 
// Usar um framework como o LangChain abstrai diversas complexidades, acelerando o desenvolvimento da aplicação.
//#nbts@mark
// ## 2. Setup
//#nbts@mark
// ### Obter uma chave de API
// 
// Para usar a API da OpenAI, você precisará de uma chave de API. Veja como obter uma:
// 
// 1. Crie uma conta no [site da OpenAI](https://platform.openai.com/signup).
// 2. Após fazer login, navegue até a [seção de Chaves de API](https://platform.openai.com/account/api-keys).
// 3. Clique em \"Create new secret key\" e dê um nome a ela.
// 4. Copie a chave imediatamente e armazene-a em um local seguro - você não poderá vê-la novamente.
// 
// **Notas Importantes de Segurança:**
// - Nunca compartilhe sua chave de API ou a inclua em repositórios públicos.
// - A OpenAI cobra com base no uso, então monitore seu consumo.
// - Considere definir limites de uso nas configurações da sua conta OpenAI
//#nbts@mark
// ## Dependências
// 
// Agora, vamos instalar as bibliotecas necessárias:
// 
// <div class="alert alert-block alert-warning">
// <b>⚠ Atenção</b>
// 
// Já instalamos as dependências neste Codespace! Entretanto, lembre-se de executar este passo quando fizer o bootstrap de um novo projeto.
// </div>
//#nbts@code
// npm install --save @langchain/core @langchain/openai
//#nbts@mark
// ## 3. Interagindo com o LLM
//#nbts@mark
// Com o ambiente configurado, devemos criar um _client_ para interagir com a API da OpenAI. Para fazer isso, instancie a classe `ChatOpenAI` do pacote `@langchain/openai`.
//#nbts@code
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
//#nbts@mark
// Ótimo! Agora, vamos finalmente interagir com o modelo.
// 
// Nosso primeiro exemplo será o "Hello World" de IA generativa, que é escrever um _haiku_! 😅
// 
// <div class="alert alert-block alert-info">
// <b>💡 O que é um haiku?</b>
// 
// Haiku, ou haicai, é um poema japonês curto, composto por três versos e 17 sílabas. É considerado um dos estilos de poesia mais curtos do mundo
// </div>
// 
// Para gerar um texto, utilize o método `invoke` do client criado no passo anterior.
//#nbts@code
await llm.invoke("escreva um haiku sobre inteligência artificial");
//#nbts@mark
// ### Parâmetros
// 
// Além do modelo e das mensagens, o endpoint de completions aceita outros parâmetros que influenciam no resultado final.
//#nbts@mark
// #### Temperatura
// 
// A **temperatura** é um parâmetro que controla o quão aleatória é a saída de um LLM. É um recurso essencial para desenvolvedores ajustarem LLMs para produzir os resultados desejados. No caso dos modelos da OpenAI, os valores possíveis para este parâmetro ficam entre `0` e `2` (valor padrão: `1`).
// 
// Funciona assim:
// 
// - **Temperatura baixa**: O modelo prioriza a seleção de tokens mais prováveis. Isso pode leva a saídas mais determinísticas.
// - **Temperatura alta**: O modelo seleciona também tokens que são menos prováveis. Isso pode levar a saídas mais variadas e criativas.
// 
// O valor de temperatura depende do caso de uso:
// 
// - **Saídas previsíveis**: Use temperaturas mais baixas para obter saídas mais determinísticas. Isso pode ser útil para assistentes de IA e bots de conversação.
// - **Saídas criativas**: Use temperaturas mais altas para obter saídas variadas. Isso pode ser útil para brainstorming, conteúdo artístico ou narrativas.
//#nbts@mark
// ### Stop
// O comportamento padrão de um LLM é gerar texto até encontrar um token de parada `<|STOP|>`. Em algumas situações, é útil controlar a quantidade de texto gerada pelo modelo.
// 
// O parâmetro `stopSequence` é utilizado para interromper a geração quando uma sequência específica de caracteres aparece na resposta. Ele permite que desenvolvedores gerenciem o comprimento da resposta e reduzam a saída excessiva sem alterar o prompt de entrada. As sequências de parada facilitam a garantia de respostas concisas e controladas dos modelos.
//#nbts@mark
// ### Max Tokens
// 
// O parâmetro `maxTokens` especifica o número máximo de tokens que pode ser gerado em uma saída do LLM.
// 
// Este parâmetro geralmente é utiizado para:
// 
// - **Limitar o tamanho das respostas**: Você pode definir uma contagem de tokens menor porque deseja que seu assistente responda de forma mais sucinta.
// - **Como proteção**: Você pode definir uma contagem de tokens menor nos casos em que deseja evitar que o modelo continue sua saída indefinidamente, especialmente se estiver trabalhando com configurações de alta temperatura que incentivam a criatividade, mas podem levar a alucinações.
// - **Otimizar o tempo de processamento**: Você também pode otimizar a rapidez com que o modelo responde a uma solicitação limitando o tamanho da saída.
//#nbts@mark
// ### 🧪 Experimento
// 
// Para alterar os parâmetros do LLM, você precisa criar um novo client.
// 
// 
// <div class="alert alert-block alert-warning">
// <b>⚠ Cuidado</b>
// 
// Por segurança, **sempre** informe um valor para `maxTokens` ao usar uma temperatura maior do que `1`. Isso evita que o modelo gere uma saída grande em casos de alucinação.
// </div>
// 
//#nbts@code
let client = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 1,
  maxTokens: 100,
  stopSequences: ["."],
})

const response = await client.invoke("escreva um haiku sobre inteligência artificial");

Deno.jupyter.md`${response.content}`
//#nbts@mark
// ### Consumo
// 
// Você pode visualizar a quantidade de tokens utilizadas em uma solicitação consultando os metadados da mensagem.
// 
// Este recurso é especialmente útil para entender o custo médio de uma solicitação ao modelo.
// 
// Referência: [Página de preços](https://openai.com/api/pricing/) da OpenAI.
//#nbts@code
await Deno.jupyter.display(response.response_metadata.usage)
//#nbts@mark
// ## 4. Conclusão
// 
// Parabéns! Você acabou de dar seus primeiros passos no mundo dos LLMs usando a API da OpenAI 😎
// 
// Aprendemos a:
// 
// 1. Usar modelos compatíveis com a interface da OpenAI com a biblioteca LangChain.
// 2. Modificar parâmetros que influenciam o comportamento do modelo, como a temperatura.
// 3. Realizar tarefas simples, como geração aberta de textos.
// 4. Contabilizar tokens e estimar custos de solicitações.
// 
// Lembre-se de que os LLMs são ferramentas poderosas, e a qualidade das respostas depende muito da qualidade dos prompts e instruções que fornecemos!