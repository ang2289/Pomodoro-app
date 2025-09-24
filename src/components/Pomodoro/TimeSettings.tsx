import React from 'react';
import { FaMinus, FaPlus, FaPause, FaPlay, FaRotateRight } from 'react-icons/fa6';
import IconButton from '../ui/IconButton';

interface TimeSettingsProps {
  workMinutes: number;
  breakMinutes: number;
  onWorkMinutesChange: (minutes: number) => void;
  onBreakMinutesChange: (minutes: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  isRunning: boolean;
  isMobile: boolean;
}

const TimeSettings: React.FC<TimeSettingsProps> = ({
  workMinutes,
  breakMinutes,
  onWorkMinutesChange,
  onBreakMinutesChange,
  onStart,
  onPause,
  onReset,
  isRunning,
  isMobile
}) => {
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
        ⏰ 時間設定
      </h3>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        {/* 工作時間設定 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#666',
            marginBottom: '8px'
          }}>
            工作時間
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconButton
              onClick={() => onWorkMinutesChange(Math.max(1, workMinutes - 1))}
              disabled={isRunning}
              variant={isRunning ? 'secondary' : 'primary'}
              icon={<FaMinus className="text-white" />}
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
              icon={<FaPlus className="text-white" />}
            />
          </div>
        </div>

        {/* 分隔線 */}
        <div style={{
          width: '1px',
          height: '40px',
          backgroundColor: '#ddd',
          margin: '0 10px'
        }} />

        {/* 休息時間設定 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#666',
            marginBottom: '8px'
          }}>
            休息時間
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconButton
              onClick={() => onBreakMinutesChange(Math.max(0, breakMinutes - 1))}
              disabled={isRunning}
              variant={isRunning ? 'secondary' : 'danger'}
              icon={<FaMinus className="text-white" />}
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
              variant={isRunning ? 'secondary' : 'danger'}
              icon={<FaPlus className="text-white" />}
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
        <IconButton
          onClick={isRunning ? onPause : onStart}
          variant={isRunning ? 'danger' : 'primary'}
          icon={isRunning ? <FaPause /> : <FaPlay />}
          label={isRunning ? '暫停' : '開始'}
        />
        <IconButton
          onClick={onReset}
          variant="secondary"
          icon={<FaRotateRight />}
          label="重置"
        />
      </div>
    </div>
  );
};

export default TimeSettings;
