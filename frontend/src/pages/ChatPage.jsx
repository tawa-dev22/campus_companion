import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Send, ArrowLeft, Package, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

const ChatPage = () => {
  const { productId, otherUserId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [product, setProduct] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef();

  const fetchChatData = async () => {
    try {
      const [messagesRes, productRes] = await Promise.all([
        client.get(`/messages/${productId}/${otherUserId}`),
        client.get(`/marketplace/${productId}`),
      ]);
      setMessages(messagesRes.data.messages);
      setProduct(productRes.data.item);
      
      // The other user is either the product owner or the one who messaged
      const pOwnerId = productRes.data.item.user?._id || productRes.data.item.user;
      if (pOwnerId === user?._id) {
        // If I am the owner, fetch the details of the interested buyer
        const userRes = await client.get(`/profile/${otherUserId}`);
        setOtherUser(userRes.data.user);
      } else {
        setOtherUser(productRes.data.item.user);
      }
    } catch (error) {
      toast.error('Failed to load conversation');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatData();
    const interval = setInterval(fetchChatData, 5000); // Polling as fallback if socket not used for messages
    return () => clearInterval(interval);
  }, [productId, otherUserId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await client.post('/messages', {
        receiverId: otherUserId,
        productId,
        message: newMessage,
      });
      setNewMessage('');
      fetchChatData();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center">Loading conversation...</div>;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white hover:bg-slate-50 text-slate-500 rounded-2xl shadow-sm border border-slate-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Conversation</h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
              <UserIcon className="w-3 h-3" />
              {otherUser?.fullName}
            </p>
          </div>
        </div>

        {product && (
          <div className="flex items-center gap-3 bg-white p-3 rounded-[24px] shadow-sm border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden shrink-0">
              {product.images?.[0] ? (
                <img 
                  src={`http://localhost:5000/${product.images[0].replace('\\', '/')}`} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200">
                  <Package className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-black text-slate-900 leading-none mb-1">{product.title}</p>
              <p className="text-[10px] font-bold text-primary tracking-wider uppercase">${product.price}</p>
            </div>
          </div>
        )}
      </div>

      <Card className="flex-1 !p-0 flex flex-col overflow-hidden !rounded-[32px] border-none shadow-xl shadow-slate-200/50 bg-white">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth bg-slate-50/30">
          {messages.map((msg, idx) => {
            const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
            return (
              <div 
                key={msg._id || idx} 
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "p-4 rounded-[24px] text-sm font-medium shadow-sm",
                  isMe 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                )}>
                  {msg.message}
                </div>
                <span className="text-[10px] text-slate-400 font-bold mt-2 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100">
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input 
              type="text" 
              placeholder="Type your message..."
              className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button 
              type="submit" 
              disabled={sending || !newMessage.trim()}
              className="rounded-2xl w-14 h-14 flex items-center justify-center p-0 shadow-lg shadow-primary/20"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;
