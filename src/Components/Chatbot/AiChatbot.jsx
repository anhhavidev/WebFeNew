import React, { useState, useRef, useEffect } from 'react';
import './AiChatbot.css';
import axiosClient from '../../Service/axiosClient';
import useAuth from '../../Hooks/useAuth';
import { SendIcon, ImageIcon, MicIcon, BotAvatar, CloseIcon, MenuIcon, ChatIcon, PlusIcon, HistoryIcon, BotIconSmall } from './Icons';

// Component chatbot AI tư vấn thời trang
const AiChatbot = () => {
    const { user } = useAuth();
    // State lưu Session ID - phục hồi từ localStorage nếu có
    const [sessionId, setSessionId] = useState(() => {
        const savedSession = localStorage.getItem('chatSessionId');
        if (savedSession) return savedSession;
        const newSession = Math.random().toString(36).substring(2, 11);
        localStorage.setItem('chatSessionId', newSession);
        return newSession;
    });
    // State lưu danh sách session chat
    const [sessions, setSessions] = useState([]);
    // State sidebar và chat window
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    // State lưu tin nhắn và input
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
    
    // Khởi tạo Speech Recognition cho nhập giọng nói
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // Khởi tạo đối tượng SpeechRecognition với ngôn ngữ vi-VN
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

    // Load lịch sử chat từ Backend khi sessionId thay đổi
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axiosClient.get(`/Chat/History/${sessionId}`);
                if (response?.data?.length > 0) {
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

    // Load danh sách Session từ backend
    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await axiosClient.get('/Chat/Sessions');
            setSessions(response.data || response || []);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    // Load sessions khi mở chat window
    useEffect(() => {
        if (isOpen) {
            fetchSessions();
        }
    }, [isOpen]);

    // Tạo mới một cuộc hội thoại
    const handleNewChat = () => {
        const newSession = Math.random().toString(36).substring(2, 11);
        setSessionId(newSession);
        localStorage.setItem('chatSessionId', newSession);
        setMessages([{ text: 'Chào ban, tôi là tư vấn viên AI của WebClothes. Bạn cần tìm gì ạ?', sender: 'bot' }]);
        setIsSidebarOpen(false);
    };

    // Chuyển đổi qua lại giữa các session
    const handleSwitchSession = (sid) => {
        setSessionId(sid);
        localStorage.setItem('chatSessionId', sid);
        setIsSidebarOpen(false);
    };

    // Bật/tắt chức năng thu âm giọng nói
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

    // Bật/tắt chat window
    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    // Gửi tin nhắn lên backend
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
            const response = await axiosClient.post('/Chat/Send', {
                SessionId: sessionId,
                Message: userMessage,
                ImageBase64: imageToSend?.base64 || null,
                ImageMimeType: imageToSend?.mimeType || null
            });
            const botReply = response.data?.reply || response.reply;
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

    // Auto-scroll xuống tin nhắn mới nhất
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Xử lý khi người dùng chọn ảnh để gửi
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

    // Render nội dung tin nhắn (hỗ trợ ảnh và markdown cơ bản)
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
                    {/* Lớp phủ khi mở sidebar */}
                    {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>}

                    {/* Sidebar - Lịch sử hội thoại */}
                    <div className={`chatbot-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                        <div className="sidebar-header">
                            <div className="sidebar-header-top">
                                <h4>Lịch sử chat</h4>
                                 <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
                                    <CloseIcon />
                                </button>
                            </div>
                            <button className="new-chat-btn" onClick={handleNewChat}>
                                <PlusIcon />
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
                                        <HistoryIcon />
                                    </div>
                                    <span className="item-title">{s.title || "Cuộc trò chuyện mới"}</span>
                                </div>
                            )) : (
                                <div className="sidebar-empty">Chưa có lịch sử</div>
                            )}
                        </div>
                    </div>

                    {/* Header chat window */}
                    <div className="ai-chatbot-header header-gradient">
                        <div className="header-title">
                            <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                <MenuIcon />
                            </button>
                            <BotAvatar /> 
                            <div className="header-text-container">
                                <h3>Trợ lý ảo AI</h3>
                                <p className="status-dot">Trực tuyến</p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={toggleChat}>
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Vùng hiển thị tin nhắn */}
                    <div className="ai-chatbot-messages smooth-scroll">
                        {messages.map((msg, index) => (
                            <div key={index} className={`ai-message-wrapper ${msg.sender}`}>
                                {msg.sender === 'bot' && (
                                    <div className="chat-avatar bot-bubble-icon">
                                        <BotIconSmall />
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
                                    <BotIconSmall />
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

                    {/* Vùng nhập liệu */}
                    <div className="ai-chatbot-input">
                        {/* Input file ẩn để chọn ảnh */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleImageSelect}
                        />
                        {/* Preview ảnh sau khi chọn */}
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
                        {/* Nút thu âm giọng nói */}
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
                        {/* Nút gửi tin nhắn */}
                        <button className="send-btn" onClick={handleSend} disabled={isLoading || (!input.trim() && !selectedImage)}>
                            <SendIcon />
                        </button>
                    </div>
                </div>
            )}
            {/* Nút toggle mở/đóng chat */}
            <div className={`ai-chatbot-toggle ${isOpen ? 'active' : ''}`} onClick={toggleChat}>
                 {isOpen ? <CloseIcon /> : <ChatIcon />}
            </div>
        </div>
    );
};

export default AiChatbot;
