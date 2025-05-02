
//#nbts@mark
// # Retrieval-Augmented Generation (RAG)
// 
// 
//#nbts@mark
// LLMs sempre respondem com confiança, mas podem inventar respostas falsas. Este fenômeno, conhecido como alucinação, acontece especialmente quando o modelo é perguntado sobre URLs, tópicos incomuns (que não foram cobertos pelo treinamento) e citações.
// 
// Podemos mitigar este problema fornecendo informações de referência, através de uma técnica chamada **Retrieval-Augmented Generation (RAG)**. Esta técnica consiste em fornecer ao modelo, como parte do prompt, trechos de uma base de conhecimento confiável que possam conter a resposta desejada pelo usuário (pesquisa em documentos).
//#nbts@mark
// ## Exemplo
// 
// Como exemplo prático, considere um assistente virtual que tem como finalidade responder dúvidas sobre conceitos marketing digital. Abaixo, fornecemos uma implementação inicial para este assistente.
//#nbts@code
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
//#nbts@code
import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "Você é um assistente de marketing digital. Responda o usuário de maneira sucinta, com uma frase direta."],
  ["user", "{query}"]
])

const naiveResponse = await prompt.pipe(llm).invoke({ query: 'o que significa mom?' })

Deno.jupyter.md`${naiveResponse.content}`;
//#nbts@mark
// ### Problema
// 
// Na verdade, **MoM** é uma sigla usada para se referir ao termo **Month Over Month**, ou seja, mês a mês. Presente em muitos relatórios, trata-se de uma forma de demonstrar a evolução de uma métrica em comparação com o mês anterior. Entretanto, ao perguntar para o assistente “o que significa mom?”, ele não trouxe a resposta esperada. Isto acontece porque o termo “mom” é amplamente utilizado na língua inglesa para se referir a "mãe".
// 
// O assistente criou uma resposta imprecisa por confusão terminológica. Uma maneira de resolver este problema é adicionar uma definição para **MoM** no prompt, utilizando a estratégia _few-shot_. No entanto, caso outros parônimos sejam usados no futuro, teremos que revisar o assistente e modificar o prompt novamente. **Esta estratégia não é escalável**!
// 
// Uma maneira mais efetiva de resolver este problema é contextualizar o LLM utilizando uma ferramenta de pesquisa, usando um glossário com definições para diversos termos deste domínio como referência.
//#nbts@mark
// ### Glossário
// 
// A página `data/digital-marketing.html` apresenta uma versão simplificada do [Glossário de Marketing e Vendas](https://www.rdstation.com/glossario/) da [RD Station](https://www.rdstation.com/). Sua estrutura é apresentada abaixo.
//#nbts@code
import fs from "node:fs/promises";

const html = await fs.readFile("./data/digital-marketing.html", "utf-8");

// Deno.jupyter.html`${html}`;
//#nbts@mark
// ### Base de Conhecimento
// 
// Podemos extrair as definições do glossário e construir uma **base de conhecimento** utilizando estas definições como referência. Para isso, precisamos executar uma série de tarefas.
//#nbts@mark
// #### Carregamento
// 
// Primeiro, precisamos carregar o conteúdo da página. Podemos usar um `DocumentLoader` do LangChain para isso, que são objetos que carregam dados de uma fonte e retornam uma lista de documentos (`Document[]`). Um `Document` é um objeto com o conteúdo (`pageContent`) e metadados (`metadata`).
// 
// Entretanto, quando temos uma página com uma estrutura bem definida, geralmente o mais adequado é criar um loader próprio. Ao carregar e separar os documentos específicamente para a tarefa em mãos, obtemos resultados de mais qualidade.
// 
// A função `extract`, definida a seguir, transforma o conteúdo `HTML` da página em documentos.
//#nbts@code
import { load } from "https://esm.sh/cheerio";
import type { Document } from "@langchain/core/documents"

/**
 * Obtém os termos e definições de uma página HTML local.
 *
 * Assume a seguinte estrutura para HTML da página:
 *
 * <article>
 *   <h3>Term</h3>
 *   <div>Definition</div>
 *   ...
 * </article>
 */
export const extract = (html: string): Document[] => {
  const documents: Document[] = [];

  try {
    const $ = load(html);

    $("article")
      .children("h3")
      .each((_, element) => {
        const term = $(element).text().trim();
        const definition = $(element)
          .next("div")
          .text()
          .replaceAll(/\s+/g, " ")
          .trim();
        if (term && definition) {
          documents.push({ pageContent: `## ${term}\n${definition}`, metadata: { term }, id: term });
        }
      });

    return documents;
  } catch (error) {
    console.error("Error fetching or parsing the webpage:", error);
  }

  return [];
};
//#nbts@code
const documents = extract(html);
documents
//#nbts@mark
// ## Indexação
// 
// Em seguida, devemos indexar os documentos para pesquisa. A estratégia mais comum empregada em pipelines RAG é executar buscas baseadas em similaridade vetorial. A **busca por similaridade** é um método para encontrar itens em um conjunto de dados que sejam semelhantes a um determinado item de consulta. Este processo de identificação de itens semelhantes geralmente acontece usando métricas de distância entre vetores.
// 
// Funciona assim:
// 
// 1. Cada item do conjunto de dados são convertidos em uma representação vetorial (_embeddings_), que são representações numéricas que capturam seu significado ou características semânticas.
// 2. O item da consulta também é convertido para uma representação vetorial.
// 3. Finalmente, o item de consulta é comparado aos vetores no conjunto de dados, e os itens com os vetores mais próximos (mais semelhantes) são retornados. Uma métrica de distância (por exemplo, distância euclidiana, similaridade de cosseno) é usada para comparar os vetores e determinar o quão semelhantes eles são.
// 
// A representação vetorial de um item é realizada por um **modelo de embeddings**. Esses modelos são capazes de capturar o "significado humano" por trás de uma consulta e compará-lo ao "significado" de um conjunto mais amplo de documentos, páginas da web, vídeos ou outras fontes de informação.
// 
// Para encontrar os benchmarks de desempenho mais recentes para modelos de embeddings, consulte as tabelas de [classificação do MTEB](https://huggingface.co/spaces/mteb/leaderboard) do [Hugging Face](https://huggingface.co/).
// 
// Neste exemplo, utilizaremos o modelo `text-embedding-3-small` da OpenAI. Os vetores serão armazenados em memória. Em uma solução real, os vetores devem ser armazenados em um banco de dados vetorial como o [Pinecone](http://pinecone.io/) e [LanceDB](https://lancedb.com/). Outra alternativa muito comum é usar a extensão `pgvector`do [Postgres](https://www.postgresql.org/).
// 
// <div class="alert alert-block alert-warning">
// <b>⚠ Importante</b>
// 
// Use o mesmo modelo de embeddings utilizado para indexar o conjunto de dados para indexar o item de pesquisa! Caso contrário, a indexação será inútil.
// </div>
//#nbts@code
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small"
});

const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
//#nbts@mark
// Pronto! 🥳
// 
// Após indexar os documentos, podemos consultar a nossa base realizando buscas por similaridade.
//#nbts@code
await vectorStore.similaritySearch("mom", 3)
//#nbts@mark
// ## Aplicação
// 
// Finalmente, podemos disponibilizar a base de conhecimento ao modelo usando o recurso de ferramentas.
//#nbts@code
import { z } from "zod";
import { tool } from "@langchain/core/tools";

const retrieve = tool(
  async ({ query }) => {
    const docs = await vectorStore.similaritySearch(query, 3);
    return docs.map((doc) => doc.pageContent);
  },
  {
    name: "retrieve",
    description: "Use para pesquisar conceitos de marketing digital em uma base de conhecimento confiável",
    schema: z.object({
      query: z.string().describe("O termo de pesquisa. Deve ser formatado como uma única palavra ou termo.")
    }),
  }
);

const tools = { retrieve }
//#nbts@code
const model = llm.bindTools(Object.values(tools))
//#nbts@code
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const messages = [
  new SystemMessage("Você é um assistente virtual especialista em marketing digital. Responda as dúvidas do usuário de maneira sucinta, com apenas uma frase."),
]

messages.push(new HumanMessage("o que significa mom?"))

const response = await model.invoke(messages);

messages.push(response);

await Deno.jupyter.display(response.tool_calls)
//#nbts@code
if (response.tool_calls) {
  for (const call of response.tool_calls) {
    const tool = tools[call.name as keyof typeof tools];
    const result = await tool.invoke(call);
    messages.push(result);
  }
}
//#nbts@code
const finalAnswer = await model.invoke(messages);

Deno.jupyter.md`${finalAnswer.content}`;