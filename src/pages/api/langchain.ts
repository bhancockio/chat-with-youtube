/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAI } from "langchain";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { type NextApiRequest, type NextApiResponse } from "next";

interface LangChainRequestBody {
  question: string;
  chat_history?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Extract the question from the request body
    const { question, chat_history = [] } = req.body as LangChainRequestBody;

    if (!question) {
      return res
        .status(400)
        .json({ message: "Invalid request. No question found" });
    }

    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY || "",
      environment: process.env.PINECONE_ENVIRONMENT || "",
    });
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX || "");

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      { pineconeIndex }
    );

    /* Use as part of a chain (currently no metadata filters) */
    const model = new OpenAI();
    const chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever()
    );

    const query = await chain.call({ question, chat_history });

    return res.status(200).json({ answer: query.text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
