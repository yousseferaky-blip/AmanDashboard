import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/AxiosIntance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* =======================
   Types
======================= */
interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: string;
  receiverId: string;
  content: string;
  senderName: string;
  senderProfilePicture: string | null;
  recipientName: string;
  recipientProfilePicture: string | null;
  isRead: boolean;
  sentAt: string;
}

interface ChatConversation {
  id: number;
  senderId: string;
  receiverId: string;
  userName: string;
  userName2?: string;
  lastMessageContent: string;
  lastMessageTimestamp: string;
  messages: ChatMessage[];
}

/* =======================
   Helpers
======================= */

// لون ثابت لكل sender
const getColorById = (id: string) => {
  const colors = [
    'bg-red-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// Avatar بالحروف
const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length === 1
    ? parts[0][0]
    : parts[0][0] + parts[1][0];
};

/* =======================
   Component
======================= */
const Message: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const storedUser = localStorage.getItem('currentUser');
  const currentUserId = storedUser ? JSON.parse(storedUser).id : '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  /* =======================
     Load Conversations
  ======================= */
  const loadConversations = async () => {
    try {
      const res = await axiosInstance.get('/Chat/conversations-admin');
      setConversations(res.data?.data ?? []);
    } catch {
      toast.error('فشل تحميل المحادثات');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadConversations();
      setLoading(false);
    };
    init();
  }, []);

  /* =======================
     Open Chat
  ======================= */
  const openChat = async (chat: ChatConversation) => {
    setSelectedChat(chat);
    setMessages(chat.messages);

    try {
      await axiosInstance.post('/Chat/mark-all-messages-as-read', {
        conversationId: chat.id,
        userId: currentUserId,
      });
    } catch {}
  };

  /* =======================
     Send Message
  ======================= */
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    try {
      await axiosInstance.post('/Chat/send-message', {
        conversationId: selectedChat.id,
        senderId: currentUserId,
        receiverId:
          selectedChat.senderId === currentUserId
            ? selectedChat.receiverId
            : selectedChat.senderId,
        content: messageText,
        date: new Date().toISOString(),
      });

      setMessageText('');

      const res = await axiosInstance.get('/Chat/conversations-admin');
      const updatedChats: ChatConversation[] = res.data?.data ?? [];

      setConversations(updatedChats);

      const updatedChat = updatedChats.find(c => c.id === selectedChat.id);
      if (updatedChat) {
        setSelectedChat(updatedChat);
        setMessages(updatedChat.messages);
      }
    } catch {
      toast.error('فشل إرسال الرسالة');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-10 h-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto p-6">
      <ToastContainer position="top-left" rtl newestOnTop />

      <h1 className="text-3xl font-bold mb-6">الرسائل</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          {conversations.map(chat => (
            <div
              key={chat.id}
              onClick={() => openChat(chat)}
              className={`p-3 border rounded cursor-pointer ${
                selectedChat?.id === chat.id
                  ? 'bg-blue-50 border-blue-300'
                  : 'hover:bg-gray-50'
              }`}
            >
              <p className="font-semibold">
                {chat.userName2 ?? chat.userName}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {chat.lastMessageContent}
              </p>
            </div>
          ))}
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col">
          {!selectedChat ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              اختر محادثة
            </div>
          ) : (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-1">
                {messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUserId;
                  const prev = messages[index - 1];
                  const isGrouped = prev && prev.senderId === msg.senderId;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} mt-1`}
                    >
                      {!isMe && !isGrouped && (
                        <div
                          className={`w-8 h-8 rounded-full text-white flex items-center justify-center mr-2 text-sm ${getColorById(msg.senderId)}`}
                        >
                          {getInitials(msg.senderName)}
                        </div>
                      )}

                      <div
                        className={`max-w-xs p-3 rounded-2xl ${
                          isMe
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {!isGrouped && (
                          <p className="text-xs font-semibold mb-1">
                            {msg.senderName}
                          </p>
                        )}

                        <p className="text-sm">{msg.content}</p>

                        <p className="text-[10px] opacity-60 mt-1 text-right">
                          {new Date(msg.sentAt).toLocaleTimeString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t p-3 flex gap-2">
                <input
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="اكتب رسالة..."
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  إرسال
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Message;
