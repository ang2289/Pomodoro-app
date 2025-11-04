import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from './ui/card';

const WishMenu: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItems = [
    {
      id: 'create-chant-wish',
      title: t('i_want_to_create_chant_wish'),
      description: t('create_chant_wish_description'),
      gradient: 'from-purple-500 to-pink-500',
      hoverGradient: 'from-purple-600 to-pink-600',
      onClick: () => navigate('/chant-wish-create')
    },
    {
      id: 'view-chant-wall',
      title: t('view_chant_wall'),
      description: t('view_chant_wall_description'),
      gradient: 'from-blue-500 to-cyan-500',
      hoverGradient: 'from-blue-600 to-cyan-600',
      onClick: () => navigate('/chant-wish-wall')
    },
    {
      id: 'view-stats',
      title: t('view_statistics'),
      description: t('view_statistics_description'),
      gradient: 'from-indigo-500 to-purple-500',
      hoverGradient: 'from-indigo-600 to-purple-600',
      onClick: () => navigate('/chant-stats')
    },
    {
      id: 'view-ranking',
      title: t('view_ranking'),
      description: t('view_ranking_description'),
      gradient: 'from-emerald-500 to-teal-500',
      hoverGradient: 'from-emerald-600 to-teal-600',
      onClick: () => navigate('/chant-ranking')
    }
  ];

  return (
    <Card className="card rounded-xl shadow-md p-4 sm:p-6">
      <div className="text-center">
        <h2 className="text-lg sm:text-xl font-bold mb-2 overflow-wrap break-word">{t('initiate_group_chanting_activity')}</h2>
        <p className="text-gray-600 mb-6 text-sm sm:text-base overflow-wrap break-word">{t('select_operation')}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`
                w-full sm:w-auto bg-gradient-to-r ${item.gradient} hover:${item.hoverGradient}
                text-white font-bold py-3 sm:py-4 px-3 sm:px-4 rounded-xl
                transition-all duration-200 transform hover:scale-105
                shadow-md hover:shadow-lg
                flex flex-col items-center justify-center
                min-h-[70px] sm:min-h-[80px] space-y-1
                overflow-wrap break-word
              `}
            >
              <div className="flex items-center justify-center">
                <span className="text-sm sm:text-base text-white overflow-wrap break-word" style={{ color: '#ffffff' }}>{item.title}</span>
              </div>
              <p className="text-xs sm:text-sm text-white text-center leading-tight overflow-wrap break-word" style={{ color: '#ffffff' }}>
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default WishMenu;
