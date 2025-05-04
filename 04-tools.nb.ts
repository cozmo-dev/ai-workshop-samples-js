
//#nbts@mark
// # Ferramentas
// 
// Neste tutorial, vamos aprender como disponibilizar ferramentas ao modelo. Este recurso permite ao modelo interagir com sistemas externos.
// 
// ## 1. Introdução
// 
// Ferramentas, também conhecidas como "chamadas de função", permitem que um modelo responda a um prompt "invocando uma função".
// 
// Embora o nome "chamada de função" implique que o modelo está executando alguma ação diretamente, na verdade não é o caso! O modelo apenas **gera os argumentos para uma função**, e executá-la (ou não) fica a critério do usuário.
// 
// Você também pode usar o recurso de ferramentas para extrair saídas estruturada do modelo, mesmo quando não pretende realizar nenhuma ação. Trata-se de uma alternativa ao recurso de "saídas estruturadas".
//#nbts@code
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
//#nbts@mark
// ## 2. Exemplo
// 
// Devido à sua arquitetura, LLMs não são bons em resolver operações matemáticas. Entretanto, podemos utilizar o recurso de ferramentas para aumentar as suas capacidades. Primeiro, vamos instanciar o nosso modelo base:
//#nbts@code
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
//#nbts@mark
// Agora, vamos adicionar ao modelo algumas ferramentas que representam operações matemáticas básicas. Pense nisso como se estivéssemos entregando uma calculadora ao modelo. Para definir os argumentos das ferramentas, vamos usar a biblioteca Zod.
//#nbts@code
const sum = tool(
  ({ a, b }) => {
    return a + b;
  },
  {
    name: "sum",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    description: "Soma `a` e `b`.",
  }
);

const subtract = tool(
  ({ a, b }) => {
    return a - b;
  },
  {
    name: "subtract",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    description: "Subtrai `b` de `a`.",
  }
);

const multiply = tool(
  ({ a, b }) => {
    return a * b;
  },
  {
    name: "multiply",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    description: "Multiplica `a` e `b`.",
  }
);

const divide = tool(
  ({ a, b }) => {
    return a / b;
  },
  {
    name: "divide",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    description: "Divide `a` por `b`.",
  }
);

const calculatorTools = { sum, subtract, multiply, divide };

const calculatorModel = llm.bindTools(Object.values(calculatorTools));
//#nbts@mark
// Perceba que, ao fazer uma pergunta que envolva as operações matemáticas, o modelo utilizará as ferramentas listadas ao invés de fornecer diretamente uma resposta ao usuário.
//#nbts@code

const calculatorMessages = [new HumanMessage("Quanto é 7 * 12?")]

const calculatorToolResponse = await calculatorModel.invoke(calculatorMessages);

calculatorMessages.push(calculatorToolResponse);

await Deno.jupyter.display(calculatorToolResponse.tool_calls)
//#nbts@mark
// Agora, devemos atender o pedido do modelo e executar as ferramenta solicitadas. Para fazer isso, iteramos sobre cada item de `response.tool_calls`. Convenientemente, o método `tool.invoke` do LangChain retorna uma mensagem pronta para ser adicionada ao histórico.
//#nbts@code
if (calculatorToolResponse.tool_calls) {
  for (const call of calculatorToolResponse.tool_calls) {
    const tool = calculatorTools[call.name as keyof typeof calculatorTools];
    const result = await tool.invoke(call);
    calculatorMessages.push(result);
  }
}

calculatorMessages
//#nbts@mark
// O último passo é fornecer o resultado da ferramenta de volta ao modelo, para que o mesmo gere a resposta final para o usuário.
//#nbts@code
const calculatorFinalAnser = await calculatorModel.invoke(calculatorMessages);

Deno.jupyter.md`${calculatorFinalAnser.content}`;
//#nbts@mark
// ## 3. Casos de Uso
//#nbts@mark
// ### Integração com APIs
// 
// Podemos empregar o recurso de ferramentas para conectar o modelo a sistemas externos, seja para recuperar dados ou para executar ações em nome do usuário.
// 
// #### 🧪 Experimento
// 
// Construa uma interface de chat para a [Pokédex](https://www.pokemon.com/br/pokedex). Inicialmente, a única função disponível será obter mais informações sobre um Pokémon. O usuário deve fornecer o nome do Pokémon para a pesquisa.
// 
// <iframe width="560" height="315" src="https://www.youtube.com/embed/z3hMX65Khtg?si=CGOSMHfJfJO5Tu9P&amp;start=631" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
// 
// **Dica**: você pode usar a [PokeAPI](https://pokeapi.co/docs/v2#pokemon) para obter informações informações detalhadas sobre um Pokémon.
//#nbts@code
import type { PokeAPI } from "pokeapi-types";

interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  abilities: string[];
  moves: string[];
  height: number;
  weight: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}

interface Error {
  error: true;
  reason: string;
}

const getPokemon = tool(
  async ({ name }): Promise<Pokemon | Error> => {
    const id = name.normalize("NFC").toLowerCase();
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, { headers: { 'Content-Type': 'application/json' }});
      const data: PokeAPI.Pokemon = await response.json();
      const pokemon: Pokemon = {
        id: data.id,
        name: data.name,
        image: data.sprites.other?.['official-artwork']?.front_default || data.sprites.other?.['dream_world']?.front_default || data.sprites.front_default,
        types: data.types.map((t) => t.type.name),
        abilities: data.abilities.map((a) => a.ability.name),
        moves: data.moves.map((m) => m.move.name),
        height: data.height,
        weight: data.weight,
        stats: {
          hp: data.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0,
          attack: data.stats.find((s) => s.stat.name === 'attack')?.base_stat || 0,
          defense: data.stats.find((s) => s.stat.name === 'defense')?.base_stat || 0,
          specialAttack: data.stats.find((s) => s.stat.name === 'special-attack')?.base_stat || 0,
          specialDefense: data.stats.find((s) => s.stat.name === 'special-defense')?.base_stat || 0,
          speed: data.stats.find((s) => s.stat.name === 'speed')?.base_stat || 0
        },
      };

      return pokemon;
    } catch (e) {
      console.log(e);
      return { error: true, reason: 'Not found' };
    }
  },
  {
    name: "getPokemon",
    schema: z.object({
      name: z.string().describe('O nome do Pokémon em inglês (en-US)'),
    }),
    description: "Obtém informações detalhadas sobre um Pokémon usando nome.",
  }
);
  
const tools = { getPokemon };

const model = llm.bindTools(Object.values(tools));
//#nbts@code
const messages = [
    new SystemMessage(`Você é um assistente de Pokédex útil que pode fornecer informações sobre Pokémon.
Você usará a ferramenta 'getPokemon' para buscar dados da PokeAPI e responder às perguntas dos usuários com precisão.
Ao mostrar estatísticas, formate-as de maneira limpa e legível.
Sempre forneça respostas concisas, mas abrangentes sobre o Pokémon solicitado.
Se você não souber algo ou não conseguir encontrar os dados, seja honesto sobre isso.
Mostre uma imagem do Pokémon no começo da sua resposta.
Use emojis para ilustrar habilidades e movimentos.`),
    new HumanMessage("Me fale sobre o Pikachu")
]

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
await Deno.jupyter.display(JSON.parse(String(messages[3].content)))
//#nbts@code
const pokedexAnswer = await model.invoke(messages);

Deno.jupyter.md`${pokedexAnswer.content}`;
//#nbts@code
await Deno.jupyter.display(pokedexAnswer.content)
//#nbts@mark
// ## 4. Conclusão
// 
// Concluímos por aqui nossa exploração de ferramentas com LLMs!
// 
// Abordamos conceitos essenciais e aplicações práticas que certamente serão úteis em seus projetos. Esperamos que este tutorial sirva como ponto de partida para suas próprias implementações. Até a próxima! 🚀