import React from 'react';

interface WeeklyData {
  day: string;
  count: number;
}

interface WeeklyStatsProps {
  weeklyData: WeeklyData[];
  totalCount: number;
}

const WeeklyStats: React.FC<WeeklyStatsProps> = ({ weeklyData, totalCount }) => {
  return (
    <div className="card p-4 sm:p-6 mx-auto" style={{
      margin: '30px auto',
      maxWidth: '600px'
    }}>
      <h3 style={{ 
        margin: '0 0 20px 0', 
        color: '#333',
        fontSize: '1.3rem',
        fontWeight: '600',
        textAlign: 'center'
      }}>
        📊 本週統計
      </h3>
      
      {(() => {
        if (totalCount === 0) {
          return (
            <div className="text-center py-10 px-5 text-gray-600 text-lg font-medium">
              📅 本週尚無完成紀錄
            </div>
          )
        }

        return (
          <div className="flex flex-col gap-3 px-2 sm:px-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex items-center gap-3 min-h-10">
                {/* 日期標籤 */}
                <div className="w-12 sm:w-14 text-sm sm:text-base font-semibold text-gray-700 text-center flex-shrink-0">
                  {day.day}
                </div>
                
                {/* 圖表條 */}
                <div className="flex-1 h-8 bg-gray-200 rounded-full relative overflow-hidden min-w-24">
                  <div 
                    className="h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max(5, (day.count / Math.max(...weeklyData.map(d => d.count))) * 100)}%`,
                      backgroundColor: day.count > 0 ? '#4ecdc4' : 'transparent'
                    }}
                  >
                    {day.count > 0 && (
                      <span className="text-white text-xs font-semibold">
                        {day.count}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* 數值顯示 */}
                <div className="w-16 sm:w-20 text-right text-sm sm:text-base font-semibold flex-shrink-0 flex items-center justify-end pr-3">
                  <span className={day.count > 0 ? 'text-teal-500' : 'text-gray-400'}>
                    {day.count > 0 ? `${day.count} 顆` : '0 顆'}
                  </span>
                </div>
              </div>
            ))}
            
            {/* 統計摘要 */}
            <div className="mt-5 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="text-sm sm:text-base font-semibold text-green-700">
                  🎯 本週總計：{totalCount} 顆番茄
                </div>
                <div className="text-xs sm:text-sm text-green-600">
                  平均每日：{Math.round(totalCount / 7 * 10) / 10} 顆
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  );
};

export default WeeklyStats;
