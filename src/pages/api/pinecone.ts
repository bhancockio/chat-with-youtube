import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { type NextApiRequest, type NextApiResponse } from "next";

interface PineconeRequestBody {
  text: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Extract the message from the request body
    const { text } = req.body as PineconeRequestBody;

    if (!text) {
      return res
        .status(400)
        .json({ message: "Invalid request. No text found" });
    }

    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY || "",
      environment: process.env.PINECONE_ENVIRONMENT || "",
    });
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX || "");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });
    const output = await splitter.createDocuments([text]);
    if (pineconeIndex) {
      await PineconeStore.fromDocuments(
        output,
        new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        }),
        {
          pineconeIndex,
        }
      );
    }
    return res.status(200).json({ message: "Successfully indexed text" });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error });
  }
}
