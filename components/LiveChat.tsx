'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export default function LiveChat() {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize session and fetch history
  useEffect(() => {
    let activeChannel: any;

    const initializeChat = async () => {
      let localSession = localStorage.getItem('luxe_chat_session');
      
      if (!localSession) {
        const { data, error } = await supabase.from('chat_sessions').insert([{}]).select().single();
        if (!error && data) {
          localSession = data.id;
          localStorage.setItem('luxe_chat_session', data.id);
        }
      }
      
      setSessionId(localSession);

      if (localSession) {
        const { data: history } = await supabase.from('chat_messages').select('*').eq('session_id', localSession).order('created_at', { ascending: true });
        if (history) setMessages(history);

        // Remove ghost channels
        supabase.getChannels().forEach(c => {
          if (c.topic === `realtime:chat_${localSession}`) supabase.removeChannel(c);
        });

        // CREATE THE CHANNEL (This was the missing line causing the crash)
        activeChannel = supabase.channel(`chat_${localSession}`);
        
        // SUBSCRIBE TO CHANGES
        activeChannel.on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages', 
          filter: `session_id=eq.${localSession}` 
        }, (payload: any) => {
          setMessages((prev) => [...prev, payload.new]);
          
          if (payload.new.sender_role === 'admin') {
            // 1. Fire the in-app toast
            toast('New message from Concierge', { icon: '💬' });
            
            // 2. Fire the Native Chrome Desktop Notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('LUXE Concierge', {
                body: payload.new.content,
                icon: '/favicon.ico' 
              });
            }
          }
        }).subscribe();
      }
    };

    initializeChat();

    return () => {
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, [supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId) return;

    const tempText = inputText;
    setInputText('');

    await supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);

    await supabase.from('chat_messages').insert([{
      session_id: sessionId,
      sender_role: 'customer',
      content: tempText
    }]);
  };

  // Ask for Chrome Notification Permission when they open the chat
  const handleOpenChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[90]">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white w-[320px] md:w-[350px] h-[450px] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-slate-200 mb-4 transition-all duration-300 transform origin-bottom-right">
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-lg">LUXE Concierge</h3>
              <p className="text-[10px] text-amber-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> We typically reply instantly
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition"><X size={20}/></button>
          </div>

          <div className="flex-1 bg-slate-50 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
            <div className="text-center text-[10px] text-slate-400 uppercase tracking-widest my-2">Chat Started</div>
            
            {messages.length === 0 && (
              <div className="bg-white p-3 rounded-md shadow-sm border border-slate-100 text-sm text-slate-700 max-w-[85%] self-start">
                Hello! How can we assist you with your luxury shopping experience today?
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`p-3 rounded-md text-sm max-w-[85%] ${msg.sender_role === 'customer' ? 'bg-amber-700 text-white self-end rounded-br-none shadow-md' : 'bg-white border border-slate-200 text-slate-800 self-start rounded-bl-none shadow-sm'}`}>
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-700 transition"
            />
            <button type="submit" className="bg-slate-900 text-white p-2 rounded-md hover:bg-amber-700 transition flex items-center justify-center">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button 
        onClick={handleOpenChat}
        className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-amber-700 transition transform hover:scale-105"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}