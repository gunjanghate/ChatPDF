import { config } from 'dotenv';
import { Worker } from 'bullmq';
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";

// Load environment variables from .env file
config();

const worker = new Worker(
    'file-upload-queue',
    async (job) => {
        console.log('Job: ', job.data);
        const data = JSON.parse(job.data);

        try {
            // Load the PDF
            console.log('Loading PDF from path:', data.filePath);
            const loader = new PDFLoader(data.filePath);
            const docs = await loader.load();

            if (!docs || docs.length === 0) {
                throw new Error('No documents found in the PDF.');
            }

            console.log("docs: ", docs);

            // Split into chunks with overlap
            const splitter = new CharacterTextSplitter({
                chunkSize: 500,
                chunkOverlap: 50,
            });
            const splitDocs = await splitter.splitDocuments(docs);
            console.log("Split into chunks:", splitDocs.length);

            if (splitDocs.length === 0) {
                throw new Error('No chunks created from the document.');
            }

            // Connect to Qdrant
            console.log('Connecting to Qdrant...');
            const client = new QdrantClient({ url: 'http://localhost:6333' });

            // Embedding documents
            console.log('Starting embedding process...');
            const embeddings = new HuggingFaceInferenceEmbeddings({
                apiKey: process.env.HF_API_KEY, // Use API key from .env
                modelName: "sentence-transformers/all-MiniLM-L6-v2"
            });

            // Storing embeddings in Qdrant
            console.log('Storing documents in Qdrant...');
            const vectorStore = await QdrantVectorStore.fromDocuments(
                splitDocs, 
                embeddings, 
                {
                    client: client,
                    collectionName: 'pdf-collection',
                    url: 'http://localhost:6333',
                }
            );

            console.log("✅ Documents successfully embedded & stored in Qdrant.");

        } catch (error) {
            // Log any error that occurs during the process
            console.error("Error during job processing:", error);

            // Send the error to the job result for tracking
            throw new Error(`Job failed: ${error.message}`);
        }
    },
    {
        concurrency: 100,
        connection: {
            host: 'localhost',
            port: 6379,
        }
    }
);
