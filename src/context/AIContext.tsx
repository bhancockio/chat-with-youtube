import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { PineconeClient } from "@pinecone-database/pinecone";
import { type VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";

interface AIContextValue {
  pineconeClient: PineconeClient | null;
  pineconeIndex: VectorOperationsApi | null;
  loadTranscript: ((text: string) => Promise<void>) | null;
}

const AIContext = createContext<AIContextValue>({
  pineconeClient: null,
  pineconeIndex: null,
  loadTranscript: null,
});

interface AIProviderProps {
  children: React.ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [pineconeClient, setPineconeClient] = useState<PineconeClient | null>(
    null
  );
  const [pineconeIndex, setPineconeIndex] =
    useState<VectorOperationsApi | null>(null);

  useEffect(() => {
    const initializePineconeClient = async () => {
      const client = new PineconeClient();
      await client.init({
        apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY || "",
        environment: process.env.NEXT_PUBLIC_PINECONE_ENVIRONMENT || "",
      });
      const pineconeIndex = client.Index(
        process.env.NEXT_PUBLIC_PINECONE_INDEX || ""
      );
      setPineconeClient(client);
      setPineconeIndex(pineconeIndex);
    };

    void initializePineconeClient();
  }, []);

  const loadTranscript = async (text: string) => {
    console.log("loading transcript");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });
    const output = await splitter.createDocuments([text]);
    if (pineconeIndex) {
      await PineconeStore.fromDocuments(
        output,
        new OpenAIEmbeddings({
          openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        }),
        {
          pineconeIndex,
        }
      );
    }
    console.log("Finished loading");
  };

  return (
    <AIContext.Provider
      value={{ pineconeClient, pineconeIndex, loadTranscript }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  return useContext(AIContext);
};
