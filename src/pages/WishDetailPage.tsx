import React from 'react';
import { useParams, Link } from 'react-router-dom';
import WishDetail from '../components/WishDetail';

const WishDetailPage: React.FC = () => {
  const { wishNo } = useParams<{ wishNo: string }>();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <Link 
            to="/wishes" 
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            返回願望牆
          </Link>
        </div>
        
        {wishNo ? (
          <WishDetail wishNo={Number(wishNo)} />
        ) : (
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-red-500">找不到此願望</p>
          </div>
        )}
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>點燈祈福，願望成真 🪔</p>
        </div>
      </div>
    </div>
  );
};

export default WishDetailPage;
