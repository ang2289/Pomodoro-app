import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
const CreatePurchasePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [products, setProducts] = useState([
        { id: '1', name: '', price: 0 }
    ]);
    const [deadline, setDeadline] = useState(new Date());
    const [notes, setNotes] = useState('');
    const [syncToGoogle, setSyncToGoogle] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // 新增商品
    const addProduct = () => {
        const newProduct = {
            id: Date.now().toString(),
            name: '',
            price: 0
        };
        setProducts([...products, newProduct]);
    };
    // 刪除商品
    const removeProduct = (productId) => {
        if (products.length > 1) {
            setProducts(products.filter(product => product.id !== productId));
        }
    };
    // 更新商品資訊
    const updateProduct = (productId, field, value) => {
        setProducts(products.map(product => product.id === productId
            ? { ...product, [field]: field === 'price' ? Number(value) : value }
            : product));
    };
    // 表單驗證
    const validateForm = () => {
        if (!title.trim()) {
            alert('請輸入團購標題');
            return false;
        }
        if (products.some(product => !product.name.trim())) {
            alert('請填寫所有商品名稱');
            return false;
        }
        if (products.some(product => product.price <= 0)) {
            alert('請輸入有效的商品價格');
            return false;
        }
        if (!deadline) {
            alert('請選擇截止時間');
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
            // 模擬 API 調用
            await new Promise(resolve => setTimeout(resolve, 1000));
            // 生成模擬的團購 ID
            const purchaseId = 'purchase-' + Date.now();
            // 跳轉到團購詳情頁面
            navigate(`/group/${id}/purchase/${purchaseId}`);
        }
        catch (error) {
            console.error('建立團購失敗:', error);
            alert('建立團購失敗，請重試');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\uD83D\uDED2 \u5EFA\u7ACB\u5718\u8CFC" }), _jsxs("div", { className: "bg-white text-gray-800 p-4 rounded-lg shadow-md w-full max-w-2xl mx-auto mt-10", children: [_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 text-lg font-semibold mb-3", children: "\u5718\u8CFC\u6A19\u984C *" }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "\u8ACB\u8F38\u5165\u5718\u8CFC\u6A19\u984C...", className: "border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-indigo-200", required: true })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-3", children: [_jsx("label", { className: "block text-gray-700 text-lg font-semibold", children: "\u5546\u54C1\u6E05\u55AE *" }), _jsx("button", { type: "button", onClick: addProduct, className: "bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-semibold", children: "\u2795 \u65B0\u589E\u5546\u54C1" })] }), _jsx("div", { className: "space-y-3", children: products.map((product) => (_jsxs("div", { className: "flex gap-3 items-center p-3 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "flex-1", children: _jsx("input", { type: "text", value: product.name, onChange: (e) => updateProduct(product.id, 'name', e.target.value), placeholder: "\u5546\u54C1\u540D\u7A31", className: "border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-indigo-200", required: true }) }), _jsx("div", { className: "w-32", children: _jsx("input", { type: "number", value: product.price, onChange: (e) => updateProduct(product.id, 'price', e.target.value), placeholder: "\u55AE\u50F9", min: "0", step: "0.01", className: "border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-indigo-200", required: true }) }), _jsx("button", { type: "button", onClick: () => removeProduct(product.id), disabled: products.length === 1, className: `px-3 py-2 rounded text-sm font-semibold transition-colors duration-200 ${products.length === 1
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-red-500 text-white hover:bg-red-600'}`, children: "\uD83D\uDDD1\uFE0F" })] }, product.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 text-lg font-semibold mb-3", children: "\u622A\u6B62\u6642\u9593 *" }), _jsx(DatePicker, { selected: deadline, onChange: (date) => setDeadline(date), showTimeSelect: true, timeFormat: "HH:mm", timeIntervals: 15, dateFormat: "yyyy/MM/dd HH:mm", placeholderText: "\u9078\u64C7\u622A\u6B62\u6642\u9593", className: "w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 text-lg font-semibold mb-3", children: "\u5099\u8A3B" }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "\u8ACB\u8F38\u5165\u5099\u8A3B\u8CC7\u8A0A...", rows: 4, className: "w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200 resize-none" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "syncToGoogle", checked: syncToGoogle, onChange: (e) => setSyncToGoogle(e.target.checked), className: "w-4 h-4 accent-blue-500 dark:accent-green-400" }), _jsx("label", { htmlFor: "syncToGoogle", className: "ml-2 text-gray-700 font-medium", children: "\uD83D\uDCC5 \u540C\u6B65\u5230 Google \u65E5\u66C6" })] }), _jsxs("div", { className: "flex gap-4 pt-4", children: [_jsx("button", { type: "button", onClick: () => navigate(`/group/${id}`), className: "flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold", children: "\u2190 \u53D6\u6D88" }), _jsx("button", { type: "submit", disabled: isSubmitting, className: `flex-1 px-4 py-2 rounded font-semibold transition-colors duration-200 ${isSubmitting
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-indigo-500 text-white hover:bg-indigo-600'}`, children: isSubmitting ? '建立中...' : '建立團購' })] })] }), _jsxs("div", { className: "mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-700", children: [_jsx("div", { className: "font-semibold mb-2", children: "\uD83D\uDCA1 \u63D0\u793A\uFF1A" }), _jsx("div", { children: "\u2022 \u5718\u8CFC\u5EFA\u7ACB\u5F8C\uFF0C\u7FA4\u7D44\u6210\u54E1\u53EF\u4EE5\u67E5\u770B\u4E26\u53C3\u8207\u5718\u8CFC" }), _jsx("div", { children: "\u2022 \u622A\u6B62\u6642\u9593\u5230\u9054\u5F8C\uFF0C\u5718\u8CFC\u5C07\u81EA\u52D5\u7D50\u675F" }), _jsx("div", { children: "\u2022 \u53EF\u4EE5\u96A8\u6642\u4FEE\u6539\u5718\u8CFC\u8CC7\u8A0A\uFF08\u5728\u622A\u6B62\u524D\uFF09" })] })] })] }));
};
export default CreatePurchasePage;
