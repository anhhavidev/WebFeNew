import React, { useState } from 'react';
import './AdminDashboard.css';
import './AiInsights.css';

const SENTIMENT_CONFIG = {
    'Tích cực': { emoji: '😊', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    'Trung tính': { emoji: '😐', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    'Tiêu cực': { emoji: '😔', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const KEYWORD_COLORS = [
    '#845EC2', '#FF6B6B', '#4facfe', '#f59e0b', '#10b981',
    '#f97316', '#8b5cf6', '#3b82f6', '#e11d48', '#6b7280',
];

export default function AiInsights() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [analyzed, setAnalyzed] = useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(
            'http://localhost:5230/api/Chat/AdminInsights',
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`Lỗi ${res.status}: Không có quyền truy cập.`);

        const json = await res.json();

        // ✅ Kiểm tra error từ backend
        if (json.error) {
            setError(json.error);
            return;
        }

        const insights = json.data || json;

        if (!insights.topKeywords || !insights.customerNeeds) {
            setError('Dữ liệu phân tích không đầy đủ. Vui lòng thử lại.');
            return;
        }

        setData(insights);
        setAnalyzed(true);
    } catch (err) {
        setError(err.message || 'Không thể kết nối AI.');
    } finally {
        setIsLoading(false);
    }
};

    const sentimentCfg = data?.sentimentSummary
        ? (SENTIMENT_CONFIG[data.sentimentSummary] || SENTIMENT_CONFIG['Trung tính'])
        : null;

    return (
        <div className="ai-insights-page">
            {/* Header */}
            <div className="ai-insights-header">
                <div>
                    <h2 className="page-title">🤖 AI Business Insights</h2>
                    <p className="page-subtitle">
                        Phân tích thông minh từ {data?.totalMessagesAnalyzed ?? '---'} tin nhắn khách hàng trong 30 ngày qua.
                    </p>
                </div>
                <button
                    className={`ai-analyze-btn ${isLoading ? 'loading' : ''}`}
                    onClick={fetchInsights}
                    disabled={isLoading}
                    id="ai-analyze-button"
                >
                    {isLoading ? (
                        <>
                            <span className="ai-btn-spinner"></span>
                            AI đang phân tích...
                        </>
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                            {analyzed ? 'Phân tích lại' : 'Bắt đầu phân tích AI'}
                        </>
                    )}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="ai-insights-error">
                    <span>⚠️ {error}</span>
                </div>
            )}

            {/* Empty state */}
            {!data && !isLoading && !error && (
                <div className="ai-insights-empty">
                    <div className="ai-empty-icon">🧠</div>
                    <h3>Chưa có phân tích nào</h3>
                    <p>Nhấn nút <strong>"Bắt đầu phân tích AI"</strong> để AI quét toàn bộ lịch sử chat và đưa ra báo cáo thông minh cho bạn.</p>
                </div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
                <div className="ai-insights-grid">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="ai-insight-card ai-skeleton-card">
                            <div className="ai-skeleton ai-skeleton-title"></div>
                            <div className="ai-skeleton ai-skeleton-text"></div>
                            <div className="ai-skeleton ai-skeleton-text short"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Results */}
            {data && !isLoading && (
                <div className="ai-insights-grid">

                    {/* Card 1: Top Keywords */}
                    <div className="ai-insight-card ai-card-keywords">
                        <div className="ai-card-icon">🔍</div>
                        <h3 className="ai-card-title">Từ khoá nổi bật</h3>
                        <p className="ai-card-subtitle">Những gì khách hàng quan tâm nhất</p>
                        <div className="ai-keyword-cloud">
                            {(data.topKeywords || []).map((kw, i) => (
                                <span
                                    key={i}
                                    className="ai-keyword-tag"
                                    style={{
                                        background: `${KEYWORD_COLORS[i % KEYWORD_COLORS.length]}18`,
                                        color: KEYWORD_COLORS[i % KEYWORD_COLORS.length],
                                        border: `1.5px solid ${KEYWORD_COLORS[i % KEYWORD_COLORS.length]}40`,
                                        fontSize: i === 0 ? '15px' : i <= 2 ? '13px' : '12px',
                                    }}
                                >
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Card 2: Sentiment */}
                    {sentimentCfg && (
                        <div className="ai-insight-card ai-card-sentiment">
                            <div className="ai-card-icon">💬</div>
                            <h3 className="ai-card-title">Cảm xúc khách hàng</h3>
                            <p className="ai-card-subtitle">Nhận xét tổng thể về cuộc trò chuyện</p>
                            <div
                                className="ai-sentiment-badge"
                                style={{ background: sentimentCfg.bg, color: sentimentCfg.color }}
                            >
                                <span className="ai-sentiment-emoji">{sentimentCfg.emoji}</span>
                                <span className="ai-sentiment-label">{data.sentimentSummary}</span>
                            </div>
                            <div className="ai-stat-number" style={{ color: sentimentCfg.color }}>
                                {data.totalMessagesAnalyzed}
                                <span className="ai-stat-unit"> tin nhắn</span>
                            </div>
                        </div>
                    )}

                    {/* Card 3: Customer Needs */}
                    <div className="ai-insight-card ai-card-needs">
                        <div className="ai-card-icon">👥</div>
                        <h3 className="ai-card-title">Nhu cầu khách hàng</h3>
                        <p className="ai-card-subtitle">AI tóm tắt từ lịch sử hội thoại</p>
                        <div className="ai-insight-text">
                            {data.customerNeeds || 'Không có dữ liệu.'}
                        </div>
                    </div>

                    {/* Card 4: Business Recommendation */}
                    <div className="ai-insight-card ai-card-recommendation">
                        <div className="ai-card-icon">💡</div>
                        <h3 className="ai-card-title">Khuyến nghị kinh doanh</h3>
                        <p className="ai-card-subtitle">Gợi ý hành động từ AI cho chủ shop</p>
                        <div className="ai-insight-text recommendation">
                            {data.businessRecommendation || 'Không có dữ liệu.'}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
