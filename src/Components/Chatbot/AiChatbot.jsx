import React, { useState, useRef, useEffect } from 'react';
import './AiChatbot.css';
import axios from 'axios';
import useAuth from '../../Hooks/useAuth';

const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const ImageIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
    </svg>
);

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const BotAvatar = () => (
    <div className="bot-avatar glass-effect">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" />
            <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" />
        </svg>
    </div>
);

const AiChatbot = () => {
    const { user } = useAuth();
    const [sessionId, setSessionId] = useState(() => {
        const savedSession = localStorage.getItem('chatSessionId');
        if (savedSession) return savedSession;
        const newSession = Math.random().toString(36).substring(2, 11);
        localStorage.setItem('chatSessionId', newSession);
        return newSession;
    });
    const [sessions, setSessions] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);       // { base64, mimeType, previewUrl }
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const fileInputRef = useRef(null);

    // Xử lý khi đăng xuất: Reset Chat
    useEffect(() => {
        if (!user) {
            const newSession = Math.random().toString(36).substring(2, 11);
            setSessionId(newSession);
            setMessages([{ text: 'Chào ban, tôi là tư vấn viên AI của WebClothes. Bạn cần tìm gì ạ?', sender: 'bot' }]);
            setSessions([]);
            setIsSidebarOpen(false);
        }
    }, [user]);
    
    // Khởi tạo Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    useEffect(() => {
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'vi-VN';
            
            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };
            
            recognitionRef.current.onresult = (event) => {
                const currentTranscript = event.results[0][0].transcript;
                setInput(prev => prev ? prev + " " + currentTranscript : currentTranscript);
            };
            
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [SpeechRecognition]);

    // Load History từ Backend
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                
                const response = await axios.get(`http://localhost:5230/api/Chat/History/${sessionId}`, config);
                if (response.data && response.data.length > 0) {
                    setMessages(response.data);
                } else {
                    setMessages([{ text: 'Chào ban, tôi là tư vấn viên AI của WebClothes. Bạn cần tìm gì ạ?', sender: 'bot' }]);
                }
            } catch (error) {
                console.error('Error fetching chat history:', error);
                setMessages([{ text: 'Chào ban, tôi là tư vấn viên AI của WebClothes. Bạn cần tìm gì ạ?', sender: 'bot' }]);
            }
        };

        fetchHistory();
    }, [sessionId]);

    // Load danh sách Session
    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await axios.get('http://localhost:5230/api/Chat/Sessions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(response.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchSessions();
        }
    }, [isOpen]);

    const handleNewChat = () => {
        const newSession = Math.random().toString(36).substring(2, 11);
        setSessionId(newSession);
        localStorage.setItem('chatSessionId', newSession);
        setMessages([{ text: 'Chào ban, tôi là tư vấn viên AI của WebClothes. Bạn cần tìm gì ạ?', sender: 'bot' }]);
        setIsSidebarOpen(false);
    };

    const handleSwitchSession = (sid) => {
        setSessionId(sid);
        localStorage.setItem('chatSessionId', sid);
        setIsSidebarOpen(false);
    };

    const toggleListen = () => {
        if (!SpeechRecognition) {
            alert('Trình duyệt của bạn không hỗ trợ chức năng thu âm giọng nói!');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSend = async () => {
        if (!input.trim() && !selectedImage) return;

        const userMessage = input.trim() || '(Đã gửi ảnh trang phục)';
        const imageToSend = selectedImage;

        // Hiển thị tin nhắn user kèm preview ảnh (nếu có)
        const userMsgObj = {
            text: userMessage,
            sender: 'user',
            imagePreview: imageToSend?.previewUrl || null
        };
        setMessages((prev) => [...prev, userMsgObj]);
        setInput('');
        setSelectedImage(null);
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const response = await axios.post('http://localhost:5230/api/Chat/Send', {
                SessionId: sessionId,
                Message: userMessage,
                ImageBase64: imageToSend?.base64 || null,
                ImageMimeType: imageToSend?.mimeType || null
            }, config);
            const botReply = response.data.reply;
            setMessages((prev) => [...prev, { text: botReply, sender: 'bot' }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [...prev, { 
                text: 'Xin lỗi, hệ thống đang bận hoặc có lỗi xảy ra. Bạn thông cảm nhé!', 
                sender: 'bot' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Giới hạn 4MB
        if (file.size > 4 * 1024 * 1024) {
            alert('Ảnh tối đa 4MB. Vui lòng chọn ảnh nhỏ hơn!');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            // dataUrl = "data:image/jpeg;base64,XXXX"
            const [header, base64] = dataUrl.split(',');
            const mimeType = header.match(/data:(.*);/)?.[1] || 'image/jpeg';
            setSelectedImage({ base64, mimeType, previewUrl: dataUrl });
        };
        reader.readAsDataURL(file);
        // Reset input để có thể chọn lại cùng file
        e.target.value = '';
    };

    const renderMessage = (text, imagePreview) => {
        return (
            <>
                {imagePreview && (
                    <img
                        src={imagePreview}
                        alt="Ảnh đã gửi"
                        className="chat-user-image"
                    />
                )}
                {text && text.split('\n').map((line, idx) => {
                    const parts = line.split(/(![\s\S]*?\]\(.*?\))/g);
                    return (
                        <div key={idx} style={{ marginBottom: '4px' }}>
                            {parts.map((part, i) => {
                                const match = part.match(/!\[(.*?)\]\((.*?)\)/);
                                if (match) {
                                    let imgSrc = match[2];
                                    if (imgSrc && !imgSrc.startsWith('http')) {
                                        imgSrc = imgSrc.startsWith('/') 
                                            ? `http://localhost:5230${imgSrc}` 
                                            : `http://localhost:5230/${imgSrc}`;
                                    }
                                    return <img key={i} src={imgSrc} alt={match[1]} style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', display: 'block', marginTop: '10px' }} />;
                                }
                                return <span key={i} dangerouslySetInnerHTML={{ __html: part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
                            })}
                        </div>
                    );
                })}
            </>
        );
    };

    return (
        <div className="ai-chatbot-container">
            {isOpen && (
                <div className="ai-chatbot-window premium-shadow glow-effect">
                    {/* Sidebar Backdrop */}
                    {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>}

                    {/* Sidebar */}
                    <div className={`chatbot-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                        <div className="sidebar-header">
                            <div className="sidebar-header-top">
                                <h4>Lịch sử chat</h4>
                                <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <button className="new-chat-btn" onClick={handleNewChat}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Chat mới
                            </button>
                        </div>
                        <div className="sidebar-list">
                            {sessions.length > 0 ? sessions.map((s) => (
                                <div 
                                    key={s.sessionId} 
                                    className={`sidebar-item ${s.sessionId === sessionId ? 'active' : ''}`}
                                    onClick={() => handleSwitchSession(s.sessionId)}
                                >
                                    <div className="item-icon">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                    </div>
                                    <span className="item-title">{s.title || "Cuộc trò chuyện mới"}</span>
                                </div>
                            )) : (
                                <div className="sidebar-empty">Chưa có lịch sử</div>
                            )}
                        </div>
                    </div>

                    <div className="ai-chatbot-header header-gradient">
                        <div className="header-title">
                            <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                            </button>
                            <BotAvatar /> 
                            <div className="header-text-container">
                                <h3>Trợ lý ảo AI</h3>
                                <p className="status-dot">Trực tuyến</p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={toggleChat}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div className="ai-chatbot-messages smooth-scroll">
                        {messages.map((msg, index) => (
                            <div key={index} className={`ai-message-wrapper ${msg.sender}`}>
                                {msg.sender === 'bot' && (
                                    <div className="chat-avatar bot-bubble-icon">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /></svg>
                                    </div>
                                )}
                                <div className={`ai-message ${msg.sender}`}>
                                    <div className="ai-msg-content">
                                        {renderMessage(msg.text, msg.imagePreview)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="ai-message-wrapper bot">
                                <div className="chat-avatar bot-bubble-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /></svg>
                                </div>
                                <div className="ai-message bot">
                                    <div className="ai-msg-content ai-typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="ai-chatbot-input">
                        {/* Hidden file input */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleImageSelect}
                        />
                        {/* Image preview khi đã chọn ảnh */}
                        {selectedImage && (
                            <div className="image-preview-container">
                                <img src={selectedImage.previewUrl} alt="preview" className="image-preview-thumb" />
                                <button
                                    className="image-preview-remove"
                                    onClick={() => setSelectedImage(null)}
                                    title="Xoá ảnh"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        <button 
                            className={`mic-btn ${isListening ? 'listening' : ''}`} 
                            onClick={toggleListen}
                            title="Nói để chat"
                        >
                            <MicIcon />
                        </button>
                        {/* Nút chọn ảnh */}
                        <button
                            className="upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Gửi ảnh trang phục để AI tư vấn"
                        >
                            <ImageIcon />
                        </button>
                        <input
                            type="text"
                            placeholder={selectedImage ? 'Nhập mô tả thêm (hoặc gửi ngay)...' : 'Nhập yêu cầu tư vấn của bạn...'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="send-btn" onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedImage)}>
                            <SendIcon />
                        </button>
                    </div>
                </div>
            )}
            <div className={`ai-chatbot-toggle ${isOpen ? 'active' : ''}`} onClick={toggleChat}>
                 {isOpen ? 
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    :
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                 }
            </div>
        </div>
    );
};

export default AiChatbot;
