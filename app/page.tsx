'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  // useChat automaticky komunikuje s vaším /api/chat/route.ts
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center">Moje Gemini AI</h1>
      
      <div className="flex-1 overflow-y-auto mb-20 px-4">
        {messages.map(m => (
          <div key={m.id} className={`mb-4 p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'}`}>
            <span className="block font-bold text-xs uppercase mb-1 text-gray-500">
              {m.role === 'user' ? 'Já' : 'AI Gemini'}
            </span>
            <span className="text-black">{m.content}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md bg-white p-4 shadow-2xl">
        <input
          className="w-full p-3 border border-gray-300 rounded shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          placeholder="Napište zprávu..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}