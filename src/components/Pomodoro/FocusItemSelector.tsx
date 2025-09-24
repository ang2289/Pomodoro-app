import React from 'react';
import { Link } from 'react-router-dom';
import { FocusItem } from '../../types/FocusItem';

interface FocusItemSelectorProps {
  focusItems: FocusItem[];
  selectedFocusItemId: string;
  onFocusItemChange: (itemId: string) => void;
}

const FocusItemSelector: React.FC<FocusItemSelectorProps> = ({
  focusItems,
  selectedFocusItemId,
  onFocusItemChange
}) => {
  return (
    <div className="card">
      <h3 style={{ 
        margin: '0 0 20px 0', 
        color: '#333',
        fontSize: '1.3rem',
        fontWeight: '600'
      }}>
        🎯 專注項目
      </h3>
      
      {/* 專注項目選擇下拉選單（僅顯示/選擇，不含管理）*/}
      <div style={{ marginBottom: '20px' }}>
        <select
          value={selectedFocusItemId}
          onChange={(e) => onFocusItemChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#fff',
            color: '#333',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
        >
          {focusItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* 管理導向按鈕 */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Link 
          to="/projects" 
          className="rounded px-4 py-2" 
          style={{
            backgroundColor: '#4ecdc4',
            color: 'white',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'background-color 0.2s',
            display: 'inline-block',
            padding: '10px 20px',
            borderRadius: '8px'
          }}
        >
          📝 管理專案
        </Link>
      </div>
    </div>
  );
};

export default FocusItemSelector;

