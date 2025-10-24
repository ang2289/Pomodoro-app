import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
const PurchaseFillPage = () => {
    const { id, purchaseId } = useParams();
    const navigate = useNavigate();
    const [purchaseData, setPurchaseData] = useState(null);
    const [userName, setUserName] = useState('');
    const [quantities, setQuantities] = useState({});
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    // 載入團購資料
    useEffect(() => {
        const loadPurchaseData = async () => {
            try {
                // 模擬 API 調用
                await new Promise(resolve => setTimeout(resolve, 500));
                // 模擬資料（與 PurchaseDetailPage 相同的資料結構）
                const mockData = {
                    id: purchaseId || 'purchase-1',
                    title: '辦公室下午茶團購',
                    products: [
                        { id: '1', name: '珍珠奶茶', price: 45 },
                        { id: '2', name: '拿鐵咖啡', price: 55 },
                        { id: '3', name: '起司蛋糕', price: 80 },
                        { id: '4', name: '巧克力餅乾', price: 35 }
                    ],
                    deadline: '2024-01-12 18:00:00',
                    notes: '請在截止時間前完成填單，逾期不候。'
                };
                setPurchaseData(mockData);
                // 初始化數量為 0
                const initialQuantities = {};
                mockData.products.forEach(product => {
                    initialQuantities[product.id] = 0;
                });
                setQuantities(initialQuantities);
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
    // 更新商品數量
    const updateQuantity = (productId, quantity) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max(0, quantity) // 確保數量不為負數
        }));
    };
    // 計算總金額
    const calculateTotal = () => {
        if (!purchaseData)
            return 0;
        return purchaseData.products.reduce((total, product) => {
            const quantity = quantities[product.id] || 0;
            return total + (product.price * quantity);
        }, 0);
    };
    // 檢查是否有選擇商品
    const hasSelectedItems = () => {
        return Object.values(quantities).some(quantity => quantity > 0);
    };
    // 表單驗證
    const validateForm = () => {
        if (!userName.trim()) {
            alert('請輸入您的姓名');
            return false;
        }
        if (!hasSelectedItems()) {
            alert('請至少選擇一項商品');
            return false;
        }
        return true;
    };
    // 提交表單
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        try {
            // 準備訂單資料
            const orderItems = Object.entries(quantities)
                .filter(([_, quantity]) => quantity > 0)
                .map(([productId, quantity]) => ({
                productId,
                quantity
            }));
            const orderData = {
                userName: userName.trim(),
                items: orderItems,
                notes: notes.trim(),
                createdAt: new Date().toISOString()
            };
            // 模擬 API 調用 - 儲存到 localStorage（實際應用中應該調用後端 API）
            const existingOrders = JSON.parse(localStorage.getItem(`purchase_${purchaseId}_orders`) || '[]');
            const newOrder = {
                id: `order-${Date.now()}`,
                ...orderData
            };
            existingOrders.push(newOrder);
            localStorage.setItem(`purchase_${purchaseId}_orders`, JSON.stringify(existingOrders));
            // 模擬 API 延遲
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('填單成功！');
            // 跳轉回團購詳情頁面
            navigate(`/group/${id}/purchase/${purchaseId}`);
        }
        catch (error) {
            console.error('提交訂單失敗:', error);
            alert('提交訂單失敗，請重試');
        }
        finally {
            setIsSubmitting(false);
        }
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
        return (_jsx("div", { className: "page", children: _jsx("div", { className: "bg-white text-gray-800 p-6 rounded-xl shadow-md w-full max-w-2xl mx-auto mt-10", children: _jsx("div", { className: "text-center", children: _jsx("div", { className: "text-lg text-gray-600", children: "\u8F09\u5165\u4E2D..." }) }) }) }));
    }
    if (!purchaseData) {
        return (_jsx("div", { className: "page", children: _jsx("div", { className: "bg-white text-gray-800 p-6 rounded-xl shadow-md w-full max-w-2xl mx-auto mt-10", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg text-red-600", children: "\u627E\u4E0D\u5230\u5718\u8CFC\u8CC7\u6599" }), _jsx(Link, { to: `/group/${id}`, className: "mt-4 inline-block bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200", children: "\u2190 \u8FD4\u56DE\u7FA4\u7D44\u9996\u9801" })] }) }) }));
    }
    return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\uD83D\uDCDD \u586B\u5BEB\u5718\u8CFC\u8A02\u55AE" }), _jsxs("div", { className: "bg-white text-gray-800 p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto mt-10", children: [_jsxs("div", { className: "mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200", children: [_jsx("h2", { className: "text-xl font-bold text-indigo-600 mb-4", children: purchaseData.title }), _jsxs("div", { className: "text-sm text-blue-700", children: [_jsxs("div", { children: ["\u622A\u6B62\u6642\u9593\uFF1A", formatDate(purchaseData.deadline)] }), purchaseData.notes && (_jsxs("div", { className: "mt-1", children: ["\u5099\u8A3B\uFF1A", purchaseData.notes] }))] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 text-lg font-semibold mb-3", children: "\u60A8\u7684\u59D3\u540D *" }), _jsx("input", { type: "text", value: userName, onChange: (e) => setUserName(e.target.value), placeholder: "\u8ACB\u8F38\u5165\u60A8\u7684\u59D3\u540D...", className: "border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-indigo-200", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 text-lg font-semibold mb-3", children: "\u9078\u64C7\u5546\u54C1 *" }), _jsx("div", { className: "space-y-3", children: purchaseData.products.map((product) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium text-gray-800", children: product.name }), _jsxs("div", { className: "text-sm text-gray-600", children: ["NT$ ", product.price] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { type: "button", onClick: () => updateQuantity(product.id, (quantities[product.id] || 0) - 1), disabled: !quantities[product.id] || quantities[product.id] <= 0, className: "w-8 h-8 rounded-full bg-gray-300 text-gray-600 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-bold", children: "-" }), _jsx("input", { type: "number", value: quantities[product.id] || 0, onChange: (e) => updateQuantity(product.id, parseInt(e.target.value) || 0), min: "0", className: "w-16 p-2 text-center border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200" }), _jsx("button", { type: "button", onClick: () => updateQuantity(product.id, (quantities[product.id] || 0) + 1), className: "w-8 h-8 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 flex items-center justify-center font-bold", children: "+" })] }), _jsxs("div", { className: "ml-4 text-right", children: [_jsx("div", { className: "text-sm text-gray-600", children: "\u5C0F\u8A08" }), _jsxs("div", { className: "font-semibold text-gray-800", children: ["NT$ ", ((quantities[product.id] || 0) * product.price).toLocaleString()] })] })] }, product.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 text-lg font-semibold mb-3", children: "\u5099\u8A3B" }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "\u5982\u6709\u7279\u6B8A\u9700\u6C42\u8ACB\u5728\u6B64\u8AAA\u660E...", rows: 3, className: "border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-indigo-200 resize-none" })] }), hasSelectedItems() && (_jsx("div", { className: "p-4 bg-green-50 rounded-lg border border-green-200", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-green-700 mb-1", children: "\u8A02\u55AE\u7E3D\u91D1\u984D" }), _jsxs("div", { className: "text-2xl font-bold text-green-800", children: ["NT$ ", calculateTotal().toLocaleString()] })] }) })), _jsxs("div", { className: "flex gap-4 pt-4", children: [_jsx(Link, { to: `/group/${id}/purchase/${purchaseId}`, className: "flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold text-center", children: "\u2190 \u53D6\u6D88" }), _jsx("button", { type: "submit", disabled: isSubmitting || !hasSelectedItems(), className: `flex-1 px-4 py-2 rounded font-semibold transition-colors duration-200 ${isSubmitting || !hasSelectedItems()
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-indigo-500 text-white hover:bg-indigo-600'}`, children: isSubmitting ? '提交中...' : '提交訂單' })] })] }), _jsxs("div", { className: "mt-6 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-700", children: [_jsx("div", { className: "font-semibold mb-2", children: "\uD83D\uDCA1 \u6CE8\u610F\u4E8B\u9805\uFF1A" }), _jsx("div", { children: "\u2022 \u8ACB\u78BA\u8A8D\u5546\u54C1\u6578\u91CF\u7121\u8AA4\u5F8C\u518D\u63D0\u4EA4" }), _jsx("div", { children: "\u2022 \u63D0\u4EA4\u5F8C\u7121\u6CD5\u4FEE\u6539\uFF0C\u8ACB\u8B39\u614E\u586B\u5BEB" }), _jsx("div", { children: "\u2022 \u5982\u6709\u554F\u984C\u8ACB\u806F\u7E6B\u5718\u8CFC\u767C\u8D77\u4EBA" })] })] })] }));
};
export default PurchaseFillPage;
