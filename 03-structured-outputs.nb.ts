
//#nbts@mark
// # Saídas Estruturadas
// 
// Neste tutorial, vamos aprender como criar saídas estruturadas usando a biblioteca LangChain.
//#nbts@mark
// ## 1. Introdução
// 
// Em muitas aplicações, como assistentes de IA (chatbots), os modelos devem responder os usuários usando texto em linguagem natural. No entanto, existem cenários em que precisamos que os modelos produzam resultados em um formato estruturado. Por exemplo: podemos querer usar a saída do modelo para invocar uma API, e portanto devemos garantir que ela esteja em conformidade com a especificação do serviço. Esta necessidade motiva o conceito de **saídas estruturadas**, em que os modelos podem ser instruídos a responder seguindo um _schema_ pré-definido.
// 
// O LangChain fornece o utilitário `withStructuredOutput()` para associar o _schema_ esperado a saída de um modelo. Esta função está disponível para todos os modelos que suportam saídas estruturadas. Se o modelo suportar mais de uma maneira de gerar saídas estruturadas (por exemplo, chamada de função vs. JSON mode), você pode configurar qual método usar passando opções extras na invocação do método.
//#nbts@mark
// ## 2. Setup
// 
// Vamos ver alguns exemplos disso em ação! Usaremos a biblioteca [Zod](https://zod.dev/) para criar um _schema_ de resposta simples.
//#nbts@mark
// Primeiro, vamos definir o modelo utilizado.
//#nbts@code
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
//#nbts@mark
// Em seguida, vamos definir o formato esperado para a resposta. Neste exemplo, queremos que o modelo gere, além da resposta, possíveis perguntas de follow-up que o usuário possa ter. Este recurso é útil para gerar botões de resposta rápida na interface de chat apresentada ao usuário.
//#nbts@code
import { z } from "zod";

const answer = z.object({
  answer: z.string().describe("A resposta para a pergunta do usuário"),
  followup_questions: z
    .array(z.string())
    .describe("Perguntas que o USUÁRIO pode fazer à seguir (quick replies)"),
});

const model = llm.withStructuredOutput(answer, { strict: true })
//#nbts@mark
// Após associar o _schema_ ao modelo, basta invocá-lo para obter a saída no formato esperado.
//#nbts@code
import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "Você é o assistente virtual do McDonalds de Criciúma - SC. Sua função é responder perguntas de usuários, via WhatsApp, sobre o funcionamento do restaurante."],
  ["user", "{question}"],
]);


const chain = prompt.pipe(model)

await chain.invoke({ question: 'Quais os horários de funcionamento?' })
//#nbts@mark
// ## 3. Casos de Uso
//#nbts@mark
// ### Chain-of-Thought (CoT)
// 
// Uma maneira eficiente de implementar a estratégia de Chain-of-Thought (CoT) é utilizar saídas estruturadas para gerar a solução do problema em passos.
// 
// #### 🧪 Experimento
// 
// Construa uma aplicação baseada em LLMs para resolver desafios de matemática e de lógica. Utilize a estratégia de Chain-of-Thought para apresentar os passos de cada solução. Exemplo de desafio:
// 
// > Um malabarista está fazendo malabares com 16 bolinhas.
// > Metade das bolas são de tênis, e metade das bolas de tênis são amarelas.
// > Quantas bolas de tênis amarelas o malabarista está usando?
//#nbts@code
// TODO: sua solução aqui
//#nbts@mark
// ### Classificação
// 
// Anteriormente, construímos uma aplicação para classificar o sentimento de tweets. Uma maneira robusta de melhorar a nossa implementação é utilizando saídas estruturadas, prevenindo alucinações do modelo ao selecionar uma categoria.
// 
// #### 🧪 Experimento
// 
// Desenvolva uma solução para analisar menções à sua empresa na plataforma [X](https://x.com). O modelo deve:
// 
// 1. Classificar cada menção como `positiva`, `neutra`, ou `negativa`.
// 2. Definir a qual produto a menção se refere (opcional).
// 3. Associar a menção a um ou mais setores envolvidos na crítica/elogio (`financeiro`, `suporte` ou `desenvolvimento`).
// 4. Definir um _score_ de urgência para priorização na fila de atendimento para responder o cliente, de `0` (menos urgente) a `5` (mais urgente).
//#nbts@code
// TODO: classificar menções
//#nbts@mark
// ## 4. Conclusão
// 
// Parabéns! Neste tutorial, aprendemos como extrair saídas estruturada de um LLM.