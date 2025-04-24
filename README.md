Watch Demo :) https://drive.google.com/file/d/12iwXs2dyR4gu95AxzSWgLS1StC32xo44/view?usp=sharing

# ChatPDF 📚– Conversational PDF Reader Powered by RAG

ChatPDF is a scalable, full-stack application that allows users to interact with their PDF documents using natural language queries. Built by replicating a modern Retrieval-Augmented Generation (RAG) system as demonstrated in a popular tutorial, ChatPDF leverages cutting-edge technologies for seamless document understanding and querying.

## ✨ Features

- 📄 **PDF Upload & Chunking** – Upload and automatically segment PDFs into chunks for efficient processing.
- 🤖 **Smart Querying with LLMs** – Use powerful language models to answer questions about your documents.
- 🔍 **Semantic Search** – Transform queries into vector embeddings to retrieve relevant context from uploaded files.
- ⚙️ **Scalable Architecture** – Designed with asynchronous workflows and modular components.
- 🔐 **Authentication with Clerk** – Secure and user-friendly login system.
- 🛠️ **Dockerized Deployment** – Containerized setup for quick dev, test, and production workflows.
- ⚡ **Queue Management** – Powered by BullMQ to handle background jobs and file processing.

## 🧰 Tech Stack

| Layer            | Technology       |
|------------------|------------------|
| Frontend         | Next.js, React   |
| Backend          | Node.js, Express |
| Authentication   | Clerk            |
| Vector Database  | Quadrant DB      |
| Queue System     | BullMQ           |
| Containerization | Docker           |

## 🧠 How It Works

1. **User uploads a PDF** via the Next.js frontend.
2. **Multer middleware** on the Express server handles the file.
3. **Document is split** into chunks and transformed into vector embeddings.
4. **Chunks are stored** in Quadrant DB for retrieval.
5. **User submits a query**, which is also embedded into a vector.
6. **Top relevant chunks are retrieved** based on vector similarity.
7. **Query + Context** are passed to an LLM (like GPT) for response generation.
8. **Response is shown** in the chat-like interface.

## 🖥️ Getting Started

### 🔧 Prerequisites

- Node.js
- Docker & Docker Compose
- OpenAI API Key
- Clerk credentials

### 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/chatpdf.git
cd chatpdf

# Copy environment variables and update them
cp .env.example .env

# Start the app
docker-compose up --build
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Environment Variables

Update your `.env` file with:

```env
CLERK_API_KEY=your-clerk-key
CLERK_FRONTEND_API=your-clerk-frontend-api
GEMINI_API_KEY=your-openai-api-key
HF_API_KEY=your-huggingface-api-key
VECTOR_DB_URL=your-quadrant-db-url
```

## 📌 Project Highlights

- 🧱 **Modular Components**: Uploading, processing, querying – all separated for better maintainability.
- 🌐 **UI/UX Best Practices**: Built-in wireframing considerations, utility classes, and conditional rendering.
- 🧪 **Built for Scale**: Designed to handle high user loads using modern queue and container strategies.
- 🧵 **Continuous Feedback Loop**: Designed with future feature improvements and user feedback in mind.

## 🛠️ Future Plans

- ✅ Role-based access control
- 📊 Add usage dashboard
- 🌍 Internationalization (i18n)
- 🧪 Integration tests with CI/CD

## 🙌 Acknowledgements

Inspired by [this video tutorial](#) on building scalable RAG systems. Big thanks to the creator for the step-by-step insights into real-world document AI applications.

---

**Made with ❤️ using HuggingFace, Gemini, Clerk, Next.js, and Quadrant DB.**
