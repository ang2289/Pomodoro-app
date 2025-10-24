import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { parseDeliveryTime, getTimeRemaining, formatTimeRemaining, shouldShowReminder } from '../utils/timeUtils';
const CountdownReminder = ({ deliveryTime }) => {
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    useEffect(() => {
        const updateCountdown = () => {
            const targetTime = parseDeliveryTime(deliveryTime);
            if (targetTime) {
                const remaining = getTimeRemaining(targetTime);
                setTimeRemaining(remaining);
            }
        };
        // 立即更新一次
        updateCountdown();
        // 每分鐘更新一次
        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    }, [deliveryTime]);
    if (!timeRemaining) {
        return null;
    }
    const showReminder = shouldShowReminder(timeRemaining);
    const timeText = formatTimeRemaining(timeRemaining);
    if (!isVisible) {
        return null;
    }
    return (_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsxs("div", { style: {
                    backgroundColor: timeRemaining.isExpired ? '#ff6b6b' : showReminder ? '#ffa726' : '#4ecdc4',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginBottom: showReminder ? '15px' : '0',
                    fontSize: '18px',
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }, children: [_jsx("div", { style: { fontSize: '24px', marginBottom: '8px' }, children: timeRemaining.isExpired ? '⏰' : showReminder ? '⚠️' : '⏳' }), _jsx("div", { children: timeRemaining.isExpired ? '領貨時間已過' : `距離領貨時間還有 ${timeText}` })] }), showReminder && (_jsxs("div", { style: {
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px solid #ffeaa7',
                    textAlign: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    position: 'relative',
                    animation: 'pulse 2s infinite'
                }, children: [_jsx("div", { style: { fontSize: '20px', marginBottom: '8px' }, children: "\uD83D\uDD14" }), _jsx("div", { children: "\u8ACB\u63D0\u9192\u5718\u53CB\u9818\u8CA8\uFF01" }), _jsx("div", { style: {
                            fontSize: '14px',
                            marginTop: '8px',
                            opacity: 0.8
                        }, children: "\u9818\u8CA8\u6642\u9593\u5373\u5C07\u958B\u59CB" }), _jsx("button", { onClick: () => setIsVisible(false), style: {
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'none',
                            border: 'none',
                            color: '#856404',
                            fontSize: '18px',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            lineHeight: 1
                        }, onMouseOver: (e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(133, 100, 4, 0.1)';
                        }, onMouseOut: (e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }, children: "\u00D7" })] })), _jsx("style", { children: `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
      ` })] }));
};
export default CountdownReminder;
