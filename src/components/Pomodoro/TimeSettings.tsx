import React from 'react';
import { useTranslation } from 'react-i18next';
// removed unused react-icons imports
import IconButton from '../ui/IconButton';

interface TimeSettingsProps {
  workMinutes: number;
  breakMinutes: number;
  onWorkMinutesChange: (minutes: number) => void;
  onBreakMinutesChange: (minutes: number) => void;
  onStart: () => void;
  onPause: () => void;
  onSkip: () => void;
  isRunning: boolean;
}

const TimeSettings: React.FC<TimeSettingsProps> = ({
  workMinutes,
  breakMinutes,
  onWorkMinutesChange,
  onBreakMinutesChange,
  onStart,
  onPause,
  onSkip,
  isRunning
}) => {
  const { t } = useTranslation();
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
        ⏰ {t('time_settings')}
      </h3>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '30px'
      }}>
        {/* 工作時間設定 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '200px' }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#666',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
          {t('work_time')}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <IconButton
              onClick={() => onWorkMinutesChange(Math.max(1, workMinutes - 1))}
              disabled={isRunning}
              variant={isRunning ? 'secondary' : 'primary'}
              icon={<span style={{ color: 'white !important', filter: 'brightness(0) invert(1)' }}>➖</span>}
              label={t('decrease')}
              className="bg-blue-600 text-white font-bold text-lg px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            />
            <input
              type="number"
              min={1}
              step={1}
              value={workMinutes}
              disabled={isRunning}
              onChange={(e) => {
                const v = parseInt(e.target.value || '0', 10);
                onWorkMinutesChange(Number.isFinite(v) ? Math.max(1, v) : 1);
              }}
              style={{
                width: '70px',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: '600',
                color: '#333',
                padding: '6px 8px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px'
              }}
            />
            <IconButton
              onClick={() => onWorkMinutesChange(Math.min(60, workMinutes + 1))}
              disabled={isRunning}
              variant={isRunning ? 'secondary' : 'primary'}
              icon={<span style={{ color: 'white !important', filter: 'brightness(0) invert(1)' }}>➕</span>}
              label={t('increase')}
              className="bg-blue-600 text-white font-bold text-lg px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            />
          </div>
        </div>


        {/* 休息時間設定 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '200px' }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#666',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
          {t('break_time')}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <IconButton
              onClick={() => onBreakMinutesChange(Math.max(0, breakMinutes - 1))}
              disabled={isRunning}
              variant={isRunning ? 'secondary' : 'primary'}
              icon={<span style={{ color: 'white !important', filter: 'brightness(0) invert(1)' }}>➖</span>}
              label={t('decrease')}
              className="bg-blue-600 text-white font-bold text-lg px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            />
            <input
              type="number"
              min={0}
              step={1}
              value={breakMinutes}
              disabled={isRunning}
              onChange={(e) => {
                const v = parseInt(e.target.value || '0', 10);
                onBreakMinutesChange(Number.isFinite(v) ? Math.max(0, v) : 0);
              }}
              style={{
                width: '70px',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: '600',
                color: '#333',
                padding: '6px 8px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px'
              }}
            />
            <IconButton
              onClick={() => onBreakMinutesChange(Math.min(30, breakMinutes + 1))}
              disabled={isRunning}
              variant={isRunning ? 'secondary' : 'primary'}
              icon={<span style={{ color: 'white !important', filter: 'brightness(0) invert(1)' }}>➕</span>}
              label={t('increase')}
              className="bg-blue-600 text-white font-bold text-lg px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            />
          </div>
        </div>
      </div>

      {/* 控制按鈕 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '25px',
        flexWrap: 'wrap'
      }}>
        {/* 開始/暫停按鈕 */}
        <IconButton
          onClick={isRunning ? onPause : onStart}
          variant={isRunning ? 'danger' : 'primary'}
          icon={isRunning ? <span style={{ color: 'white', filter: 'none' }}>⏸️</span> : <span style={{ color: 'white', filter: 'none' }}>▶️</span>}
          label={isRunning ? t('pause') : t('start')}
          className="flex-1 hover:scale-105"
        />
        
        {/* ⏹ 提早結束按鈕 */}
        <IconButton
          onClick={onSkip}
          variant="danger"
          icon={<span style={{ color: 'white', filter: 'none' }}>⏹</span>}
          label={t('stop_early')}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 transition-colors duration-200 hover:scale-105"
        />
        
        {/* 移除重置按鈕 */}
        {/* <IconButton
          onClick={onReset}
          variant="secondary"
          icon={<FaRotateRight />}
          label={t('reset')}
        /> */}
      </div>
    </div>
  );
};

export default TimeSettings;
