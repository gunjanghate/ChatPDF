import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { Queue } from 'bullmq';
import { Worker } from 'bullmq';
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const que = new Queue("file-upload-queue", {
  connection: {
    host: 'localhost',
    port: 6379,
  }
});
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });
const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  await que.add('pdf-upload', JSON.stringify({
    fileName: req.file.filename,
    filePath: req.file.path,
    fileSize: req.file.size,
    mimeType: req.file.mimetype
  }));
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully', file: req.file });
});

app.get('/chat', async (req, res) => {
  try {
    const query = req.query.message || "What is nodejs?";

    const client = new QdrantClient({ url: 'http://localhost:6333' });

    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HF_API_KEY,
      modelName: "sentence-transformers/all-MiniLM-L6-v2"
    });

    const vectorStore = new QdrantVectorStore(embeddings, {
      client: client,
      collectionName: 'pdf-collection',
      url: 'http://localhost:6333',
    });

    const retriever = vectorStore.asRetriever({ k: 5 });
    const searchResults = await retriever.invoke(query);

    const prompt = `
You are a helpful assistant. Use only the following context from a PDF to answer the question.

Context:
${searchResults.map(doc => doc.pageContent).join('\n\n')}

Question: ${query}
    `.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ message: text, docs: searchResults });

  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({
      error: "An error occurred while processing your request",
      message: error.message
    });
  }
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
