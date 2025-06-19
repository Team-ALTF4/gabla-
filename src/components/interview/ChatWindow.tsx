'use client';
import { useEffect, useRef, useState } from 'react';
import { useInterviewStore } from '@/app/store/useInterviewStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChatWindow({ sendMessage }: { sendMessage: (text: string) => void }) {
  const [text, setText] = useState('');
  const messages = useInterviewStore((state) => state.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text.trim());
      setText('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-t">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'interviewer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-2 rounded-lg ${msg.sender === 'interviewer' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
         <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}