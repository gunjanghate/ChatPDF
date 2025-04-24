'use client'
import * as React from 'react'
import { PlaceholdersAndVanishInput } from "../../components/ui/placeholders-and-vanish-input"
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}

interface IMessage {
  role: 'assistant' | 'user';
  content?: string;
  documents?: Doc[];
}

const Chat: React.FC = () => {
  // Function to convert markdown-style bold text to JSX
const formatTextWithBold = (text: string | undefined) => {
  if (!text) return null;
  
  // Split by bold pattern **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    // Check if this part is a bold text pattern
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the asterisks and wrap in strong tag
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};
  const placeholders = [
    "Summarize the main findings of this PDF.",
    "What are the key takeaways from page 5?",
    "Explain the conclusion in simple terms.",
    "What are the definitions mentioned in this document?",
    "Can you list the important dates or events?",
  ];

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    // Clear input and set loading
    setMessage("");
    setLoading(true);

    try {
      // Fetch response from server
      const res = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(message)}`);
      const data = await res.json();

      // Add assistant message with response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.message,
          documents: data?.docs,
        },
      ]);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process your request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen ">
      {/* Header */}
      <header className="bg-gradient-to-tr from-white  to-red-100 border-b py-4 px-6 flex gap-2">
        <h1 className="text-3xl tracking-tighter font-extrabold text-transparent bg-gradient-to-br bg-clip-text from-red-400 to-red-700 text-shadow-orange-800">ChatPDF </h1><span className='text-3xl'>🤖</span>
      </header>

      {/* Chat container with messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <pre className='text-xl font-semibold'>Upload a PDF document and start chatting with your pdf! </pre>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={` rounded-lg p-4 shadow-sm ${msg.role === 'user'
                      ? 'max-w-[80%] text-wrap bg-gradient-to-br from-red-400 to-red-700 text-white font-bold rounded-br-none drop-shadow-xl'
                      : 'min-w-[80%] bg-red-50 text-gray-800 rounded-bl-none border border-red-100 drop-shadow-xl'
                    }`}
                >
                  <pre className="text-wrap text-md">{formatTextWithBold(msg.content)}</pre>

                  {/* Source documents section */}
                  {msg.documents && msg.documents.length > 0 && (
                    <div className="mt-4 pt-3  border-t border-gray-200">
                      <p className="text-lg font-medium mb-2">
                        Sources:
                      </p>
                      <div className="space-y-3">
                        {msg.documents.map((doc, docIndex) => (
                          <div
                            key={docIndex}
                            className={`p-3 rounded-lg text-sm ${msg.role === 'user'
                                ? 'bg-blue-700/50'
                                : 'bg-white '
                              }`}
                          >
                            {doc.metadata?.loc?.pageNumber && (
                              <pre className="font-medium mb-1">
                                Page: {doc.metadata.loc.pageNumber}
                              </pre>
                            )}
                            {doc.metadata?.source && (
                              <pre className="text-xs opacity-70 mb-1">
                                {doc.metadata.source}
                              </pre>
                            )}
                            <pre className="text-md text-wrap">{doc.pageContent}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <pre className="text-gray-600">Thinking...</pre>
                <pre>This may take a while. Please Wait ⌛</pre>
              </div>
            </div>
          )}

          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input container */}

      <div className="max-w-3xl mx-auto bg-transparent p-4">
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={onSubmit}

        />
      </div>

    </div>
  );
}

export default Chat;