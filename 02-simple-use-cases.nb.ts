
//#nbts@mark
// # Casos de Uso Simples
// 
// Neste notebook, vamos aprender a realizar tarefas simples usando um LLM. Ao final deste tutorial, você saberá como:
// 
// - Criar modelos de prompts usando LangChain
// - Classificar textos e registros
// - Traduzir textos preservando nuances semânticas do idioma
//#nbts@mark
// ## 1. Setup
//#nbts@mark
// Primeiro, vamos criar um _client_ para interagir com a API da OpenAI. Lembre-se que, para fazer isso, devemos instanciar a classe `ChatOpenAI` do pacote `@langchain/openai`.
//#nbts@code
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
//#nbts@mark
// ## 2. Modelos de Prompts
// 
// No exercício anterior, passamos uma mensagem diretamente para o modelo de linguagem. Normalmente, o prompt é construído a partir de uma combinação de inputs do usuário e lógica da aplicação. Essa lógica da aplicação geralmente pega a entrada bruta do usuário e a transforma em uma lista de mensagens prontas para serem passadas ao LLM. Transformações comuns incluem adicionar uma mensagem do sistema ou formatar um modelo com a entrada do usuário.
// 
// Modelos de prompt (`PromptTemplate`) são um conceito no LangChain projetado para ajudar nessa transformação. Eles recebem a entrada do usuário e retornam um prompt pronto uso.
// 
// Os modelos de prompt recebem como entrada um objeto, onde cada chave representa uma variável usada no prompt e que deve ser preenchida para gerar uma saída. Ao realizar a transformação, o modelo de prompt gera um `PromptValue`. Este objeto pode ser passado diretamente para um modelo ou convertido para uma lista de mensagens.
//#nbts@mark
// ### StringPromptTemplate
// 
// Esses modelos de prompt são usados ​​para formatar uma única string e geralmente são usados ​​para entradas mais simples.
//#nbts@code
import { PromptTemplate } from "@langchain/core/prompts";

const stringPromptTemplate = PromptTemplate.fromTemplate(
  "Me conte uma piada sobre {topic}"
);

stringPromptTemplate
//#nbts@code
await stringPromptTemplate.invoke({ topic: "gatos" });
//#nbts@code
await stringPromptTemplate.invoke({ topic: "programação" });
//#nbts@mark
// ### ChatPromptTemplate
// 
// Esses modelos de prompt são usados para formatar um conjunto de mensagens usado como prompt para um modelo de chat. Esta classe, na verdade, agrupa um conjunto de modelos - um para cada mensagem. A maneira mais comum de criar um prompt de chat é a seguinte:
//#nbts@code
import { ChatPromptTemplate } from "@langchain/core/prompts";

const chatPromptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "Você é um assistente prestativo."],
  ["user", "Me conte uma piada sobre {topic}"],
]);

const value = await chatPromptTemplate.invoke({ topic: "programação" });
value.toChatMessages()
//#nbts@mark
// Neste exemplo, o `ChatPromptTemplate` criará duas mensagens. A primeira é uma mensagem para o prompt de sistema, sem variáveis para formatar. A segunda é uma mensagem de usuário, e será formatada com o tópico que o usuário passar.
//#nbts@mark
// ### Chamar um modelo com o prompt
// 
// Para chamar um modelo usando o prompt, você deve construir uma cadeia (chain).
//#nbts@code
const jokeChain = chatPromptTemplate.pipe(model)

const joke = await jokeChain.invoke({ topic: "programação" })

Deno.jupyter.md`${joke.content}`

//#nbts@mark
// ## 3. Classificação
// 
// Os LLMs são ótimos em tarefas de classificação!
// 
// ### 🧪 Experimento
// 
// Escreva um prompt que classifica o sentimento de um tweet em `positivo`, `neutro` ou `negativo`. Prepare a aplicação para receber os tweets dinamicamente usando um modelo de prompt.
//#nbts@code
// TODO: classificar tweets
//#nbts@mark
// ## 4. Tradução
// 
// Outro caso de uso em que LLMs apresentam ótimos resultados é o de tradução.
// 
// ### 🧪 Experimento
// 
// Elabore um modelo prompt para tradução de textos. Ele deve receber três variáveis:
// 
// - `source`: idioma de origem do texto (valor padrão: `"idioma de origem"`).
// - `target`: idioma de destino para o qual o texto deve ser traduzido.
// - `text`: o texto a ser traduzido.
//#nbts@code
// TODO: traduzir textos
//#nbts@mark
// ## 5. Conclusão
// 
// Parabéns! Neste tutorial, você aprendeu a criar suas primeiras aplicações reais usando um LLM.