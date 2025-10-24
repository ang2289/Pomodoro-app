import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const WeeklyStats = ({ weeklyData, totalCount }) => {
    return (_jsxs("div", { className: "card p-4 sm:p-6 mx-auto", style: {
            margin: '30px auto',
            maxWidth: '600px'
        }, children: [_jsx("h3", { style: {
                    margin: '0 0 20px 0',
                    color: '#333',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    textAlign: 'center'
                }, children: "\uD83D\uDCCA \u672C\u9031\u7D71\u8A08" }), (() => {
                if (totalCount === 0) {
                    return (_jsx("div", { className: "text-center py-10 px-5 text-gray-600 text-lg font-medium", children: "\uD83D\uDCC5 \u672C\u9031\u5C1A\u7121\u5B8C\u6210\u7D00\u9304" }));
                }
                return (_jsxs("div", { className: "flex flex-col gap-3 px-2 sm:px-4", children: [weeklyData.map((day, index) => (_jsxs("div", { className: "flex items-center gap-3 min-h-10", children: [_jsx("div", { className: "w-12 sm:w-14 text-sm sm:text-base font-semibold text-gray-700 text-center flex-shrink-0", children: day.day }), _jsx("div", { className: "flex-1 h-8 bg-gray-200 rounded-full relative overflow-hidden min-w-24", children: _jsx("div", { className: "h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2", style: {
                                            width: (() => {
                                                const maxCount = Math.max(...weeklyData.map(d => d.count));
                                                if (maxCount === 0)
                                                    return '0%';
                                                const percentage = (day.count / maxCount) * 100;
                                                // 加入最小寬度限制，避免最大值很小時所有條都滿格
                                                const minWidth = maxCount <= 2 ? Math.min(percentage, 60) : percentage;
                                                return `${minWidth}%`;
                                            })(),
                                            backgroundColor: (() => {
                                                const maxCount = Math.max(...weeklyData.map(d => d.count));
                                                if (day.count === 0)
                                                    return 'transparent';
                                                // 根據相對強度調整顏色深淺
                                                const intensity = maxCount > 0 ? day.count / maxCount : 0;
                                                if (intensity >= 0.8)
                                                    return '#4ecdc4'; // 深色 - 高強度
                                                if (intensity >= 0.5)
                                                    return '#5dd5d5'; // 中深色 - 中高強度
                                                if (intensity >= 0.3)
                                                    return '#6ddddd'; // 中色 - 中強度
                                                return '#7de5e5'; // 淺色 - 低強度
                                            })()
                                        }, children: day.count > 0 && (_jsx("span", { className: "text-white text-xs font-semibold", children: day.count })) }) }), _jsx("div", { className: "w-16 sm:w-20 text-right text-sm sm:text-base font-semibold flex-shrink-0 flex items-center justify-end pr-3", children: _jsx("span", { className: day.count > 0 ? 'text-teal-500' : 'text-gray-400', children: day.count > 0 ? `${day.count} 顆` : '0 顆' }) })] }, index))), _jsx("div", { className: "mt-5 p-5 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200 shadow-sm", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg sm:text-xl font-bold text-green-700 mb-1", children: "\uD83C\uDFAF \u672C\u9031\u7E3D\u8A08" }), _jsxs("div", { className: "text-2xl sm:text-3xl font-bold text-green-600", children: [totalCount, " \u9846\u756A\u8304"] })] }), _jsx("div", { className: "text-center pt-2 border-t border-green-200", children: _jsxs("div", { className: "text-sm sm:text-base font-semibold text-green-600", children: ["\u5E73\u5747\u6BCF\u65E5\uFF1A", Math.round(totalCount / 7 * 10) / 10, " \u9846"] }) })] }) })] }));
            })()] }));
};
export default WeeklyStats;
