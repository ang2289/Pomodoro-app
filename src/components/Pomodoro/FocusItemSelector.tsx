import React, { useEffect, useRef, useState } from 'react';
// removed unused Link import
import { FocusItem } from '../../types/FocusItem';
import IconButton from '../IconButton';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedItem = focusItems.find(i => i.id === selectedFocusItemId) || focusItems[0];

  // 獲取翻譯後的專注項目名稱
  const getFocusItemName = (name: string) => {
    const defaultFocusItemNames = ['讀書', '寫作', '工作', '運動', '冥想', '抄經'];
    if (defaultFocusItemNames.includes(name)) {
      const translationKey = `focus_items_list.${name}`;
      const translated = t(translationKey);
      // 如果翻譯返回的是對象或與鍵相同，則使用原始名稱
      if (typeof translated === 'string' && translated !== translationKey) {
        return translated;
      }
      return name;
    }
    // 對於自定義專注項目，使用原始名稱
    return name;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="card">
      <h3 style={{ 
        margin: '0 0 20px 0', 
        color: '#333',
        fontSize: '1.3rem',
        fontWeight: '600'
      }}>
        {t('focus_items')}
      </h3>
      
      {/* 自訂下拉選單 */}
      <div style={{ marginBottom: '20px' }} ref={wrapperRef}>
        {/* 顯示已選 */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
        >
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: selectedItem?.color || '#3b82f6' }} />
            <span className="text-gray-800">{selectedItem ? getFocusItemName(selectedItem.name) : '—'}</span>
          </span>
          <svg className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
          </svg>
        </button>

        {open && (
          <div className="mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
            {focusItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  onFocusItemChange(item.id);
                  setOpen(false);
                }}
              >
                <span className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: item.color }} />
                <span className="text-gray-800">{getFocusItemName(item.name)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 管理導向按鈕 */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <IconButton label={`🗂 ${t('manage_categories')}`} to="/projects" />
      </div>
    </div>
  );
};

export default FocusItemSelector;

