import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { careerApi } from '../api/career.api';

const CareerChat = () => {
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['chatHistory', sessionId],
    queryFn: () => careerApi.getChatHistory(sessionId),
    enabled: !!sessionId,
  });

  const chatMutation = useMutation({
    mutationFn: (msg: string) => careerApi.chat(msg, sessionId),
    onSuccess: (data) => {
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
      }
      setMessage('');
      // Refetch chat history to show new messages
      if (data.sessionId) {
        setTimeout(() => refetchHistory(), 500);
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to send message. Please check your OpenAI API key.');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatMutation.data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || chatMutation.isPending) return;
    const currentMessage = message;
    chatMutation.mutate(currentMessage);
  };

  // Build messages array from chat history
  const messages = chatHistory || [];

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Career Chat Agent</h1>
        <p className="mt-2 text-gray-600">
          Get personalized career guidance from your AI mentor
        </p>
      </div>

      <div className="card max-w-4xl mx-auto">
        <div className="h-[500px] overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-lg mb-2">👋 Welcome to Career Chat!</p>
              <p>Ask me anything about your career, skills, or job search.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-900 border'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-white border rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question about your career..."
            disabled={chatMutation.isPending}
          />
          <button
            type="submit"
            disabled={!message.trim() || chatMutation.isPending}
            className="btn-primary"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default CareerChat;
