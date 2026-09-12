import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import IconButton from '../components/ui/IconButton';
import { useParams, useNavigate, Link } from 'react-router-dom';
const PurchaseDetailPage = () => {
    const { id, purchaseId } = useParams();
    const navigate = useNavigate();
    const [purchaseData, setPurchaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    // 模擬資料載入
    useEffect(() => {
        const loadPurchaseData = async () => {
            try {
                // 模擬 API 調用
                await new Promise(resolve => setTimeout(resolve, 500));
                // 模擬資料
                const mockData = {
                    id: purchaseId || 'purchase-1',
                    title: '辦公室下午茶團購',
                    products: [
                        { id: '1', name: '珍珠奶茶', price: 45 },
                        { id: '2', name: '拿鐵咖啡', price: 55 },
                        { id: '3', name: '起司蛋糕', price: 80 },
                        { id: '4', name: '巧克力餅乾', price: 35 }
                    ],
                    orders: [
                        {
                            id: 'order-1',
                            userName: '張小明',
                            items: [
                                { productId: '1', quantity: 2 },
                                { productId: '2', quantity: 1 },
                                { productId: '3', quantity: 1 }
                            ],
                            createdAt: '2024-01-10 14:30:00'
                        },
                        {
                            id: 'order-2',
                            userName: '李小華',
                            items: [
                                { productId: '1', quantity: 1 },
                                { productId: '4', quantity: 3 }
                            ],
                            createdAt: '2024-01-10 15:15:00'
                        },
                        {
                            id: 'order-3',
                            userName: '王大強',
                            items: [
                                { productId: '2', quantity: 2 },
                                { productId: '3', quantity: 1 },
                                { productId: '4', quantity: 2 }
                            ],
                            createdAt: '2024-01-10 16:00:00'
                        }
                    ],
                    deadline: '2024-01-12 18:00:00',
                    notes: '請在截止時間前完成填單，逾期不候。',
                    createdAt: '2024-01-10 14:00:00'
                };
                setPurchaseData(mockData);
            }
            catch (error) {
                console.error('載入團購資料失敗:', error);
            }
            finally {
                setLoading(false);
            }
        };
        loadPurchaseData();
    }, [purchaseId]);
    // 計算每項商品的總訂購數量
    const getProductTotalQuantity = (productId) => {
        if (!purchaseData)
            return 0;
        return purchaseData.orders.reduce((total, order) => {
            const item = order.items.find(item => item.productId === productId);
            return total + (item ? item.quantity : 0);
        }, 0);
    };
    // 計算總金額
    const getTotalAmount = () => {
        if (!purchaseData)
            return 0;
        return purchaseData.orders.reduce((total, order) => {
            return total + order.items.reduce((orderTotal, item) => {
                const product = purchaseData.products.find(p => p.id === item.productId);
                return orderTotal + (product ? product.price * item.quantity : 0);
            }, 0);
        }, 0);
    };
    // 格式化日期
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    if (loading) {
        return (_jsx("div", { className: "page", children: _jsx("div", { className: "bg-white text-gray-800 p-4 rounded-lg shadow-md w-full max-w-4xl mx-auto mt-10", children: _jsx("div", { className: "text-center", children: _jsx("div", { className: "text-lg text-gray-600", children: "\u8F09\u5165\u4E2D..." }) }) }) }));
    }
    if (!purchaseData) {
        return (_jsx("div", { className: "page", children: _jsx("div", { className: "bg-white text-gray-800 p-4 rounded-lg shadow-md w-full max-w-4xl mx-auto mt-10", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg text-red-600", children: "\u627E\u4E0D\u5230\u5718\u8CFC\u8CC7\u6599" }), _jsx(Link, { to: `/group/${id}`, className: "mt-4 inline-block bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200", children: "\u2190 \u8FD4\u56DE\u7FA4\u7D44\u9996\u9801" })] }) }) }));
    }
    return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\uD83D\uDED2 \u5718\u8CFC\u8A73\u60C5" }), _jsxs("div", { className: "bg-white text-gray-800 p-4 rounded-lg shadow-md w-full max-w-4xl mx-auto mt-10", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-2", children: purchaseData.title }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("div", { children: ["\u5EFA\u7ACB\u6642\u9593\uFF1A", formatDate(purchaseData.createdAt)] }), _jsxs("div", { children: ["\u622A\u6B62\u6642\u9593\uFF1A", formatDate(purchaseData.deadline)] }), purchaseData.notes && (_jsxs("div", { className: "mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg", children: [_jsx("div", { className: "font-semibold text-yellow-800", children: "\uD83D\uDCDD \u5099\u8A3B\uFF1A" }), _jsx("div", { className: "text-yellow-700", children: purchaseData.notes })] }))] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-800 mb-4", children: "\uD83D\uDCE6 \u5546\u54C1\u6E05\u55AE" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full border-collapse border border-gray-300", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-50", children: [_jsx("th", { className: "border border-gray-300 px-4 py-2 text-left", children: "\u5546\u54C1\u540D\u7A31" }), _jsx("th", { className: "border border-gray-300 px-4 py-2 text-right", children: "\u55AE\u50F9" }), _jsx("th", { className: "border border-gray-300 px-4 py-2 text-right", children: "\u7E3D\u8A02\u8CFC\u91CF" }), _jsx("th", { className: "border border-gray-300 px-4 py-2 text-right", children: "\u5C0F\u8A08" })] }) }), _jsx("tbody", { children: purchaseData.products.map((product) => {
                                                const totalQuantity = getProductTotalQuantity(product.id);
                                                const subtotal = product.price * totalQuantity;
                                                return (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "border border-gray-300 px-4 py-2 font-medium", children: product.name }), _jsxs("td", { className: "border border-gray-300 px-4 py-2 text-right", children: ["NT$ ", product.price] }), _jsx("td", { className: "border border-gray-300 px-4 py-2 text-right", children: _jsx("span", { className: `px-2 py-1 rounded text-sm ${totalQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`, children: totalQuantity }) }), _jsxs("td", { className: "border border-gray-300 px-4 py-2 text-right font-semibold", children: ["NT$ ", subtotal.toLocaleString()] })] }, product.id));
                                            }) }), _jsx("tfoot", { children: _jsxs("tr", { className: "bg-gray-100 font-bold", children: [_jsx("td", { colSpan: 3, className: "border border-gray-300 px-4 py-2 text-right", children: "\u7E3D\u8A08\uFF1A" }), _jsxs("td", { className: "border border-gray-300 px-4 py-2 text-right text-lg", children: ["NT$ ", getTotalAmount().toLocaleString()] })] }) })] }) })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("h3", { className: "text-xl font-semibold text-gray-800 mb-4", children: ["\uD83D\uDC65 \u586B\u55AE\u8005\u6E05\u55AE (", purchaseData.orders.length, " \u4EBA)"] }), purchaseData.orders.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx("div", { className: "text-lg", children: "\u5C1A\u7121\u586B\u55AE\u8005" }), _jsx("div", { className: "text-sm", children: "\u5FEB\u4F86\u6210\u70BA\u7B2C\u4E00\u500B\u586B\u55AE\u7684\u4EBA\u5427\uFF01" })] })) : (_jsx("div", { className: "space-y-4", children: purchaseData.orders.map((order) => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsx("div", { className: "font-semibold text-gray-800", children: order.userName }), _jsx("div", { className: "text-sm text-gray-500", children: formatDate(order.createdAt) })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3", children: order.items.map((item) => {
                                                const product = purchaseData.products.find(p => p.id === item.productId);
                                                if (!product)
                                                    return null;
                                                return (_jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [_jsx("div", { className: "font-medium text-gray-800", children: product.name }), _jsxs("div", { className: "text-sm text-gray-600", children: ["\u6578\u91CF\uFF1A", item.quantity, " \u00D7 NT$ ", product.price] }), _jsxs("div", { className: "text-sm font-semibold text-gray-800", children: ["\u5C0F\u8A08\uFF1ANT$ ", (product.price * item.quantity).toLocaleString()] })] }, item.productId));
                                            }) }), _jsx("div", { className: "mt-3 pt-3 border-t border-gray-200", children: _jsxs("div", { className: "text-right font-semibold text-gray-800", children: ["\u7E3D\u8A08\uFF1ANT$ ", order.items.reduce((total, item) => {
                                                        const product = purchaseData.products.find(p => p.id === item.productId);
                                                        return total + (product ? product.price * item.quantity : 0);
                                                    }, 0).toLocaleString()] }) })] }, order.id))) }))] }), _jsxs("div", { className: "flex gap-4 pt-6 border-t border-gray-200", children: [_jsx(Link, { to: `/group/${id}`, className: "flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold text-center", children: "\u2190 \u8FD4\u56DE\u7FA4\u7D44\u9996\u9801" }), _jsx(IconButton, { onClick: () => navigate(`/group/${id}/purchase/${purchaseId}/fill`), label: "\uD83D\uDCDD \u6211\u8981\u586B\u55AE", className: "flex-1 bg-blue-700 text-white" })] })] })] }));
};
export default PurchaseDetailPage;
