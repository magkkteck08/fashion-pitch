'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Clock, CheckCircle, Bell } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

// Helper for Service Worker Push Notification
const triggerServiceWorkerNotification = async (messageText: string) => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      registration.showNotification('🔔 New Product Inquiry', {
        body: messageText,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true
      });
    } catch (err) {
      console.error('Service Worker Notification Error:', err);
    }
  }
};

export default function AdminChatDashboard() {
  const supabase = createClient();
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Register Service Worker and Ask Admin for Notification Permission on load
  useEffect(() => {
    console.log("1. Admin Dashboard Component Mounted!");
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW Error:', err));
      }
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // 1. GLOBAL LISTENER: Track ALL sessions and ALL new messages instantly
  useEffect(() => {
    fetchSessions();

    const globalSub = supabase.channel('global_admin_tracker')
      // Listen for brand new chat sessions
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_sessions' }, (payload: any) => {
        fetchSessions();
        toast('New Customer Started a Chat!', { icon: '🚨' });
        triggerServiceWorkerNotification('A new customer is waiting for a reply.');
      })
      // Listen for ALL new messages across every session
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload: any) => {
        console.log("GLOBAL NEW MESSAGE RECEIVED:", payload.new);
        
        if (payload.new.sender_role === 'customer') {
          // Trigger the notifications instantly!
          toast('New message received', { icon: '💬' });
          triggerServiceWorkerNotification(payload.new.content);
          fetchSessions(); // Refresh the sidebar to show the latest time
        }
      })
      .subscribe((status) => {
        console.log("Global Tracker Status:", status);
      });

    return () => { supabase.removeChannel(globalSub); };
  }, [supabase]);

  const fetchSessions = async () => {
    const { data } = await supabase.from('chat_sessions').select('*').order('updated_at', { ascending: false });
    if (data) setSessions(data);
  };

  // 2. Load messages just for the active chat window to display on screen
  useEffect(() => {
    if (!activeSession) return;
    
    let msgSub: any;
    const loadMessages = async () => {
      const { data } = await supabase.from('chat_messages').select('*').eq('session_id', activeSession.id).order('created_at', { ascending: true });
      if (data) setMessages(data);

      msgSub = supabase.channel(`active_window_${activeSession.id}`);
      msgSub.on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages', 
        filter: `session_id=eq.${activeSession.id}` 
      }, (payload: any) => {
        // Just append the text to the screen (Notifications are now handled globally above)
        setMessages((prev) => [...prev, payload.new]);
      }).subscribe();
    };

    loadMessages();

    return () => {
      if (msgSub) supabase.removeChannel(msgSub);
    };
  }, [activeSession, supabase]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Send reply as Admin
  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeSession) return;

    const temp = replyText;
    setReplyText('');

    await supabase.from('chat_messages').insert([{
      session_id: activeSession.id,
      sender_role: 'admin',
      content: temp
    }]);

    await supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', activeSession.id);
  };

  const markResolved = async () => {
    if (!activeSession) return;
    await supabase.from('chat_sessions').update({ status: 'closed' }).eq('id', activeSession.id);
    setActiveSession(null);
  };

  return (
    <div className="flex h-[85vh] bg-white border border-slate-200 shadow-sm mt-6">
      {/* LEFT PANEL: Active Sessions List */}
      <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="font-serif font-bold tracking-widest text-sm uppercase">Live Inquiries</h2>
          <span className="bg-amber-600 text-xs px-2 py-1 rounded-full font-bold">{sessions.filter(s => s.status !== 'closed').length}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {sessions.map(session => (
            <div 
              key={session.id} 
              onClick={() => setActiveSession(session)}
              className={`p-4 border-b border-slate-200 cursor-pointer transition ${activeSession?.id === session.id ? 'bg-white border-l-4 border-l-amber-700' : 'hover:bg-slate-100'} ${session.status === 'closed' ? 'opacity-50' : ''}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <User size={14} className="text-slate-400"/> {session.customer_name || 'Guest User'}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} /> {new Date(session.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-2">
                Status: <span className={session.status === 'closed' ? 'text-red-500' : 'text-green-600'}>{session.status}</span>
              </p>
            </div>
          ))}
          {sessions.length === 0 && <div className="p-6 text-center text-xs text-slate-400 uppercase tracking-widest">No active chats</div>}
        </div>
      </div>

      {/* RIGHT PANEL: Active Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {activeSession ? (
          <>
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900">{activeSession.customer_name || 'Guest User'}</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Session ID: {activeSession.id.split('-')[0]}</p>
              </div>
              <button onClick={markResolved} className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-green-600 flex items-center gap-1 border border-slate-200 px-3 py-1.5 rounded bg-white transition">
                <CheckCircle size={14}/> Mark Resolved
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-3 rounded-md text-sm max-w-[70%] ${msg.sender_role === 'admin' ? 'bg-slate-900 text-white self-end rounded-br-none shadow-md' : 'bg-white border border-slate-200 text-slate-800 self-start rounded-bl-none shadow-sm'}`}>
                  {msg.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendReply} className="p-4 bg-white border-t border-slate-200 flex gap-3">
              <input 
                type="text" 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={activeSession.status === 'closed'}
                placeholder={activeSession.status === 'closed' ? "This chat is closed." : "Type your reply..."} 
                className="flex-1 border border-slate-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-amber-700 transition disabled:bg-slate-100"
              />
              <button 
                type="submit" 
                disabled={activeSession.status === 'closed' || !replyText.trim()}
                className="bg-amber-700 text-white px-6 py-3 rounded-md hover:bg-slate-900 transition flex items-center justify-center font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Bell size={48} className="mb-4 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">Listening for incoming chats...</p>
          </div>
        )}
      </div>
    </div>
  );
}