import React from 'react';
// removed unused icon imports
import IconButton from '../ui/IconButton';
import { FocusItem } from '../../types/FocusItem';

interface SearchFields {
  focusItem: boolean;
  description: boolean;
  time: boolean;
}

interface SearchRecordsProps {
  searchKeyword: string;
  onSearchKeywordChange: (keyword: string) => void;
  searchFields: SearchFields;
  onSearchFieldsChange: (fields: SearchFields) => void;
  searchHistory: string[];
  showSuggestions: boolean;
  onShowSuggestionsChange: (show: boolean) => void;
  isSearchInputFocused: boolean;
  onIsSearchInputFocusedChange: (focused: boolean) => void;
  focusItems: FocusItem[];
  onSearch: () => void;
  onClearSearch: () => void;
  isSearching: boolean;
  isMobile: boolean;
  // 新增日期相關屬性
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
}

const SearchRecords: React.FC<SearchRecordsProps> = ({
  searchKeyword,
  onSearchKeywordChange,
  searchFields,
  onSearchFieldsChange,
  searchHistory,
  showSuggestions,
  onShowSuggestionsChange,
  isSearchInputFocused: _isSearchInputFocused,
  onIsSearchInputFocusedChange,
  focusItems: _focusItems,
  onSearch,
  onClearSearch,
  isSearching,
  isMobile,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange
}) => {
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSuggestionClick = (suggestion: string) => {
    onSearchKeywordChange(suggestion);
    onShowSuggestionsChange(false);
  };

  const handleSearchFieldToggle = (field: keyof SearchFields) => {
    onSearchFieldsChange({
      ...searchFields,
      [field]: !searchFields[field]
    });
  };

  // 日期變更處理
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onStartDateChange(value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onEndDateChange(value);
  };

  // 獲取今天的日期（YYYY-MM-DD 格式）
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="card" style={{
      marginBottom: '30px',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      padding: '20px'
    }}>
      <h3 style={{ 
        margin: '0 0 20px 0', 
        color: '#333',
        fontSize: '1.3rem',
        fontWeight: '600',
        textAlign: 'center'
      }}>
        🔍 搜尋功能
      </h3>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* 搜尋關鍵字輸入 */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="搜尋專注項目、描述或時間..."
            value={searchKeyword}
            onChange={handleSearchInputChange}
            onFocus={handleSearchInputFocus}
            onBlur={handleSearchInputBlur}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
          />
          
          {/* 搜尋建議下拉選單 */}
          {showSuggestions && searchHistory.length > 0 && (
            <div style={{
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
            }}>
              {searchHistory
                .filter(history => history.toLowerCase().includes(searchKeyword.toLowerCase()))
                .slice(0, 5)
                .map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: index < 4 ? '1px solid #f0f0f0' : 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <span style={{ color: '#333' }}>{suggestion}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 搜尋欄位選擇 */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#555'
          }}>
            搜尋範圍：
          </label>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {[
              { key: 'focusItem', label: '專注項目' },
              { key: 'description', label: '描述內容' },
              { key: 'time', label: '完成時間' }
            ].map(({ key, label }) => (
              <label key={key} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#555'
              }}>
                <input
                  type="checkbox"
                  checked={searchFields[key as keyof SearchFields]}
                  onChange={() => handleSearchFieldToggle(key as keyof SearchFields)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#4ecdc4'
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* 日期範圍選擇 */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#555'
          }}>
            日期範圍：
          </label>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '12px',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '12px',
                color: '#666'
              }}>
                開始日期：
              </label>
              <input
                type="date"
                value={startDate || getTodayDate()}
                onChange={handleStartDateChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '12px',
                color: '#666'
              }}>
                結束日期：
              </label>
              <input
                type="date"
                value={endDate || getTodayDate()}
                onChange={handleEndDateChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* 搜尋按鈕 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <IconButton
            onClick={onSearch}
            disabled={isSearching}
            variant="primary"
            icon="🔍"
            label={isSearching ? '搜尋中...' : '搜尋'}
            className="hover:scale-105"
          />
          <IconButton
            onClick={onClearSearch}
            variant="primary"
            icon="🗑️"
            label="清除"
            className="hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchRecords;
