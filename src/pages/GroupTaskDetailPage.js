import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getGroupTasks } from '../services/groupTaskService';
import { getTaskRegistrationsByTaskId, isUserRegisteredForTask, getUserTaskRegistration, registerForTask, updateTaskRegistrationStatus, getTaskStatistics } from '../services/taskRegistrationService';
import CountdownReminder from '../components/CountdownReminder';
import { exportRegistrationList } from '../services/exportService';
const GroupTaskDetailPage = () => {
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [userRegistration, setUserRegistration] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [userName, setUserName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');
    const [showExportMessage, setShowExportMessage] = useState('');
    // 載入任務資料
    useEffect(() => {
        const loadTaskData = () => {
            if (!taskId) {
                setErrorMessage('任務 ID 不存在');
                setIsLoading(false);
                return;
            }
            try {
                // 載入任務資料
                const tasks = getGroupTasks();
                const foundTask = tasks.find(t => t.id === taskId);
                if (!foundTask) {
                    setErrorMessage('找不到該任務');
                    setIsLoading(false);
                    return;
                }
                setTask(foundTask);
                // 載入報名資料
                const taskRegistrations = getTaskRegistrationsByTaskId(taskId);
                setRegistrations(taskRegistrations);
                // 檢查使用者是否已報名
                const userId = 'user-' + Date.now(); // 模擬使用者 ID
                const isRegistered = isUserRegisteredForTask(userId, taskId);
                if (isRegistered) {
                    const userReg = getUserTaskRegistration(userId, taskId);
                    setUserRegistration(userReg);
                }
                else {
                    setShowRegistrationForm(true);
                }
                setIsLoading(false);
            }
            catch (error) {
                console.error('載入任務資料失敗:', error);
                setErrorMessage('載入任務資料失敗');
                setIsLoading(false);
            }
        };
        loadTaskData();
    }, [taskId]);
    const handleRegister = async () => {
        if (!userName.trim()) {
            setErrorMessage('請輸入您的姓名');
            return;
        }
        if (quantity < 1) {
            setErrorMessage('購買數量必須大於 0');
            return;
        }
        if (!task)
            return;
        setIsRegistering(true);
        setErrorMessage('');
        try {
            const userId = 'user-' + Date.now(); // 模擬使用者 ID
            const registration = registerForTask({
                taskId: task.id,
                userId,
                userName: userName.trim(),
                quantity
            });
            setUserRegistration(registration);
            setRegistrations(prev => [...prev, registration]);
            setShowRegistrationForm(false);
            setUserName('');
            setQuantity(1);
        }
        catch (error) {
            console.error('報名失敗:', error);
            setErrorMessage('報名失敗，請重試');
        }
        finally {
            setIsRegistering(false);
        }
    };
    const handleToggleCompletion = async (registrationId, isCompleted) => {
        try {
            const success = updateTaskRegistrationStatus(registrationId, isCompleted);
            if (success) {
                setRegistrations(prev => prev.map(reg => reg.id === registrationId ? { ...reg, isCompleted } : reg));
                if (userRegistration && userRegistration.id === registrationId) {
                    setUserRegistration(prev => prev ? { ...prev, isCompleted } : null);
                }
            }
        }
        catch (error) {
            console.error('更新狀態失敗:', error);
            setErrorMessage('更新狀態失敗，請重試');
        }
    };
    const handleExportList = () => {
        if (!task)
            return;
        try {
            const result = exportRegistrationList(task, registrations);
            if (result.success) {
                setShowExportMessage('✅ 報名名單匯出成功！');
                setTimeout(() => setShowExportMessage(''), 3000);
            }
            else {
                setShowExportMessage('❌ 匯出失敗，請重試');
                setTimeout(() => setShowExportMessage(''), 3000);
            }
        }
        catch (error) {
            console.error('匯出失敗:', error);
            setShowExportMessage('❌ 匯出過程中發生錯誤');
            setTimeout(() => setShowExportMessage(''), 3000);
        }
    };
    const statistics = task ? getTaskStatistics(task.id) : null;
    if (isLoading) {
        return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\u8F09\u5165\u4E2D..." }), _jsxs("div", { style: { textAlign: 'center', marginTop: '40px' }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '20px' }, children: "\u23F3" }), _jsx("div", { style: { fontSize: '18px', color: '#888' }, children: "\u6B63\u5728\u8F09\u5165\u4EFB\u52D9\u8CC7\u6599..." })] })] }));
    }
    if (!task || errorMessage) {
        return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\u274C \u932F\u8AA4" }), _jsx("div", { style: {
                        backgroundColor: '#ff6b6b',
                        color: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        margin: '30px 0',
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: '500'
                    }, children: errorMessage || '找不到該任務' })] }));
    }
    return (_jsxs("div", { className: "page", children: [_jsx("h1", { children: "\uD83D\uDCCB \u4EFB\u52D9\u8A73\u60C5" }), task && (_jsx(CountdownReminder, { deliveryTime: task.deliveryTime })), _jsxs("div", { style: {
                    backgroundColor: '#2a2a2a',
                    borderRadius: '16px',
                    padding: '30px',
                    marginBottom: '30px'
                }, children: [_jsx("h2", { style: {
                            color: '#4ecdc4',
                            marginBottom: '20px',
                            fontSize: '1.8em',
                            fontWeight: '600'
                        }, children: task.title }), _jsxs("div", { style: {
                            display: 'grid',
                            gap: '15px',
                            marginBottom: '20px'
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }, children: [_jsx("span", { style: { color: '#888', fontSize: '16px', fontWeight: '500' }, children: "\u6240\u5C6C\u7FA4\u7D44\uFF1A" }), _jsxs("span", { style: { color: '#fff', fontSize: '16px', fontWeight: '500' }, children: ["\u7FA4\u7D44\u4EE3\u78BC ", task.groupId] })] }), _jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }, children: [_jsx("span", { style: { color: '#888', fontSize: '16px', fontWeight: '500' }, children: "\u9818\u8CA8\u6642\u9593\uFF1A" }), _jsx("span", { style: { color: '#fff', fontSize: '16px', fontWeight: '500' }, children: task.deliveryTime })] })] }), statistics && (_jsxs("div", { style: {
                            backgroundColor: '#1a1a1a',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '20px'
                        }, children: [_jsxs("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                    gap: '15px',
                                    marginBottom: '20px'
                                }, children: [_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { color: '#4ecdc4', fontSize: '24px', fontWeight: '700' }, children: statistics.totalRegistrations }), _jsx("div", { style: { color: '#888', fontSize: '14px' }, children: "\u5831\u540D\u4EBA\u6578" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { color: '#4ecdc4', fontSize: '24px', fontWeight: '700' }, children: statistics.totalQuantity }), _jsx("div", { style: { color: '#888', fontSize: '14px' }, children: "\u7E3D\u6578\u91CF" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { color: '#4ecdc4', fontSize: '24px', fontWeight: '700' }, children: statistics.completedQuantity }), _jsx("div", { style: { color: '#888', fontSize: '14px' }, children: "\u5DF2\u9818\u53D6" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { color: '#ff6b6b', fontSize: '24px', fontWeight: '700' }, children: statistics.pendingQuantity }), _jsx("div", { style: { color: '#888', fontSize: '14px' }, children: "\u5F85\u9818\u53D6" })] })] }), _jsx("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '15px',
                                    flexWrap: 'wrap'
                                }, children: _jsx("button", { onClick: handleExportList, style: {
                                        backgroundColor: '#4ecdc4',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px 24px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }, onMouseOver: (e) => {
                                        e.currentTarget.style.backgroundColor = '#45b7aa';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }, onMouseOut: (e) => {
                                        e.currentTarget.style.backgroundColor = '#4ecdc4';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }, children: "\uD83D\uDCCA \u532F\u51FA\u5831\u540D\u540D\u55AE" }) })] })), showExportMessage && (_jsx("div", { style: {
                            backgroundColor: showExportMessage.includes('✅') ? '#1a3a1a' : '#3a1a1a',
                            color: showExportMessage.includes('✅') ? '#4ecdc4' : '#ff6b6b',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '16px',
                            fontWeight: '500',
                            textAlign: 'center'
                        }, children: showExportMessage }))] }), userRegistration ? (_jsxs("div", { style: {
                    backgroundColor: '#2a2a2a',
                    borderRadius: '16px',
                    padding: '30px',
                    marginBottom: '30px',
                    border: '2px solid #4ecdc4'
                }, children: [_jsx("h3", { style: {
                            color: '#4ecdc4',
                            marginBottom: '20px',
                            fontSize: '1.4em',
                            fontWeight: '600'
                        }, children: "\u2705 \u60A8\u7684\u5831\u540D\u8CC7\u8A0A" }), _jsxs("div", { style: {
                            display: 'grid',
                            gap: '15px',
                            marginBottom: '20px'
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }, children: [_jsx("span", { style: { color: '#888', fontSize: '16px' }, children: "\u59D3\u540D\uFF1A" }), _jsx("span", { style: { color: '#fff', fontSize: '16px', fontWeight: '500' }, children: userRegistration.userName })] }), _jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }, children: [_jsx("span", { style: { color: '#888', fontSize: '16px' }, children: "\u8CFC\u8CB7\u6578\u91CF\uFF1A" }), _jsx("span", { style: { color: '#fff', fontSize: '16px', fontWeight: '500' }, children: userRegistration.quantity })] }), _jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }, children: [_jsx("span", { style: { color: '#888', fontSize: '16px' }, children: "\u9818\u8CA8\u72C0\u614B\uFF1A" }), _jsx("span", { style: {
                                            color: userRegistration.isCompleted ? '#4ecdc4' : '#ff6b6b',
                                            fontSize: '16px',
                                            fontWeight: '500'
                                        }, children: userRegistration.isCompleted ? '已領取' : '未領取' })] })] }), _jsxs("label", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500'
                        }, children: [_jsx("input", { type: "checkbox", checked: userRegistration.isCompleted, onChange: (e) => handleToggleCompletion(userRegistration.id, e.target.checked), className: "accent-blue-500 dark:accent-green-400", style: {
                                    transform: 'scale(1.5)',
                                    marginRight: '8px'
                                } }), "\u6211\u5DF2\u9818\u8CA8"] })] })) : showRegistrationForm && (_jsxs("div", { style: {
                    backgroundColor: '#2a2a2a',
                    borderRadius: '16px',
                    padding: '30px',
                    marginBottom: '30px'
                }, children: [_jsx("h3", { style: {
                            color: '#4ecdc4',
                            marginBottom: '20px',
                            fontSize: '1.4em',
                            fontWeight: '600'
                        }, children: "\uD83D\uDCDD \u5831\u540D\u8868\u55AE" }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    color: '#fff',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }, children: "\u6211\u7684\u540D\u7A31" }), _jsx("input", { type: "text", value: userName, onChange: (e) => setUserName(e.target.value), placeholder: "\u8ACB\u8F38\u5165\u60A8\u7684\u59D3\u540D", style: {
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '2px solid #333',
                                    backgroundColor: '#1a1a1a',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    boxSizing: 'border-box'
                                } })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                                    display: 'block',
                                    color: '#fff',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }, children: "\u8CFC\u8CB7\u6578\u91CF" }), _jsx("input", { type: "number", value: quantity, onChange: (e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1)), min: "1", style: {
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '2px solid #333',
                                    backgroundColor: '#1a1a1a',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    boxSizing: 'border-box'
                                } })] }), errorMessage && (_jsx("div", { style: {
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '14px',
                            textAlign: 'center'
                        }, children: errorMessage })), _jsx("button", { onClick: handleRegister, disabled: isRegistering || !userName.trim(), style: {
                            width: '100%',
                            backgroundColor: (isRegistering || !userName.trim()) ? '#95a5a6' : '#4ecdc4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '14px',
                            cursor: (isRegistering || !userName.trim()) ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: '600'
                        }, children: isRegistering ? '報名中...' : '提交報名' })] })), _jsxs("div", { style: {
                    backgroundColor: '#2a2a2a',
                    borderRadius: '16px',
                    padding: '30px'
                }, children: [_jsxs("h3", { style: {
                            color: '#4ecdc4',
                            marginBottom: '20px',
                            fontSize: '1.4em',
                            fontWeight: '600'
                        }, children: ["\uD83D\uDC65 \u5DF2\u5831\u540D\u6210\u54E1 (", registrations.length, ")"] }), registrations.length === 0 ? (_jsx("div", { style: {
                            textAlign: 'center',
                            color: '#888',
                            padding: '40px 0',
                            fontSize: '16px'
                        }, children: "\u5C1A\u7121\u6210\u54E1\u5831\u540D" })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: registrations.map(registration => (_jsxs("div", { style: {
                                backgroundColor: '#1a1a1a',
                                borderRadius: '12px',
                                padding: '16px',
                                border: registration.isCompleted ? '2px solid #4ecdc4' : '2px solid #333',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                                color: '#fff',
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                marginBottom: '4px'
                                            }, children: registration.userName }), _jsxs("div", { style: {
                                                color: '#888',
                                                fontSize: '14px'
                                            }, children: ["\u6578\u91CF\uFF1A", registration.quantity] })] }), _jsx("div", { style: {
                                        color: registration.isCompleted ? '#4ecdc4' : '#ff6b6b',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }, children: registration.isCompleted ? '✅ 已領取' : '⏳ 待領取' })] }, registration.id))) }))] })] }));
};
export default GroupTaskDetailPage;
