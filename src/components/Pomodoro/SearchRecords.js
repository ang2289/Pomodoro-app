import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// removed unused icon imports
import IconButton from '../ui/IconButton';
const SearchRecords = ({ searchKeyword, onSearchKeywordChange, searchFields, onSearchFieldsChange, searchHistory, showSuggestions, onShowSuggestionsChange, isSearchInputFocused: _isSearchInputFocused, onIsSearchInputFocusedChange, focusItems: _focusItems, onSearch, onClearSearch, isSearching, isMobile, startDate, onStartDateChange, endDate, onEndDateChange }) => {
    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        onSearchKeywordChange(value);
        onShowSuggestionsChange(value.length > 0 && searchHistory.length > 0);
    };
    const handleSearchInputFocus = () => {
        onIsSearchInputFocusedChange(true);
        onShowSuggestionsChange(searchKeyword.length > 0 && searchHistory.length > 0);
    };
    const handleSearchInputBlur = () => {
        setTimeout(() => {
            onIsSearchInputFocusedChange(false);
            onShowSuggestionsChange(false);
        }, 200);
    };
    const handleSuggestionClick = (suggestion) => {
        onSearchKeywordChange(suggestion);
        onShowSuggestionsChange(false);
    };
    const handleSearchFieldToggle = (field) => {
        onSearchFieldsChange({
            ...searchFields,
            [field]: !searchFields[field]
        });
    };
    // 日期變更處理
    const handleStartDateChange = (e) => {
        const value = e.target.value;
        onStartDateChange(value);
    };
    const handleEndDateChange = (e) => {
        const value = e.target.value;
        onEndDateChange(value);
    };
    // 獲取今天的日期（YYYY-MM-DD 格式）
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };
    return (_jsxs("div", { className: "card", style: {
            marginBottom: '30px',
            border: '1px solid #e9ecef',
            borderRadius: '12px',
            padding: '20px'
        }, children: [_jsx("h3", { style: {
                    margin: '0 0 20px 0',
                    color: '#333',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    textAlign: 'center'
                }, children: "\uD83D\uDD0D \u641C\u5C0B\u529F\u80FD" }), _jsxs("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }, children: [_jsxs("div", { style: { position: 'relative' }, children: [_jsx("input", { type: "text", placeholder: "\u641C\u5C0B\u5C08\u6CE8\u9805\u76EE\u3001\u63CF\u8FF0\u6216\u6642\u9593...", value: searchKeyword, onChange: handleSearchInputChange, onFocus: handleSearchInputFocus, onBlur: handleSearchInputBlur, style: {
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '16px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                } }), showSuggestions && searchHistory.length > 0 && (_jsx("div", { style: {
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'white',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    zIndex: 1000,
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }, children: searchHistory
                                    .filter(history => history.toLowerCase().includes(searchKeyword.toLowerCase()))
                                    .slice(0, 5)
                                    .map((suggestion, index) => (_jsx("div", { onClick: () => handleSuggestionClick(suggestion), style: {
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
                                        transition: 'background-color 0.2s'
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                    }, children: _jsx("span", { style: { color: '#333' }, children: suggestion }) }, index))) }))] }), _jsxs("div", { children: [_jsx("label", { style: {
                                    display: 'block',
                                    marginBottom: '10px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#555'
                                }, children: "\u641C\u5C0B\u7BC4\u570D\uFF1A" }), _jsx("div", { style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '12px'
                                }, children: [
                                    { key: 'focusItem', label: '專注項目' },
                                    { key: 'description', label: '描述內容' },
                                    { key: 'time', label: '完成時間' }
                                ].map(({ key, label }) => (_jsxs("label", { style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#555'
                                    }, children: [_jsx("input", { type: "checkbox", checked: searchFields[key], onChange: () => handleSearchFieldToggle(key), style: {
                                                width: '16px',
                                                height: '16px',
                                                accentColor: '#4ecdc4'
                                            } }), label] }, key))) })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                    display: 'block',
                                    marginBottom: '10px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#555'
                                }, children: "\u65E5\u671F\u7BC4\u570D\uFF1A" }), _jsxs("div", { style: {
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: '12px',
                                    alignItems: 'center'
                                }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: {
                                                    display: 'block',
                                                    marginBottom: '5px',
                                                    fontSize: '12px',
                                                    color: '#666'
                                                }, children: "\u958B\u59CB\u65E5\u671F\uFF1A" }), _jsx("input", { type: "date", value: startDate || getTodayDate(), onChange: handleStartDateChange, style: {
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    fontSize: '14px',
                                                    border: '2px solid #e0e0e0',
                                                    borderRadius: '6px',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s',
                                                    boxSizing: 'border-box'
                                                } })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: {
                                                    display: 'block',
                                                    marginBottom: '5px',
                                                    fontSize: '12px',
                                                    color: '#666'
                                                }, children: "\u7D50\u675F\u65E5\u671F\uFF1A" }), _jsx("input", { type: "date", value: endDate || getTodayDate(), onChange: handleEndDateChange, style: {
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    fontSize: '14px',
                                                    border: '2px solid #e0e0e0',
                                                    borderRadius: '6px',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s',
                                                    boxSizing: 'border-box'
                                                } })] })] })] }), _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '15px',
                            flexWrap: 'wrap'
                        }, children: [_jsx(IconButton, { onClick: onSearch, disabled: isSearching, variant: "primary", icon: "\uD83D\uDD0D", label: isSearching ? '搜尋中...' : '搜尋', className: "hover:scale-105" }), _jsx(IconButton, { onClick: onClearSearch, variant: "primary", icon: "\uD83D\uDDD1\uFE0F", label: "\u6E05\u9664", className: "hover:scale-105" })] })] })] }));
};
export default SearchRecords;
