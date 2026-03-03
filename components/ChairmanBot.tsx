import React from 'react';
import { User, MessageCircle } from 'lucide-react';

interface ChairmanBotProps {
  message: string;
  emotion?: 'neutral' | 'happy' | 'angry' | 'sad';
  character?: 'rich' | 'idol' | 'chairman' | 'sport';
  hideImage?: boolean;
}

export const ChairmanBot: React.FC<ChairmanBotProps> = ({ message, emotion = 'neutral', character = 'rich', hideImage = false }) => {
  const getEmotionImage = () => {
    // If it's the 'rich' persona, use emotion images. 
    // For others, we only have neutral for now as requested.
    if (character !== 'rich') {
      return `/assets/characters/${character}_neutral.png`;
    }

    switch (emotion) {
      case 'happy': return '/assets/characters/rich_happy.png';
      case 'angry': return '/assets/characters/rich_angry.png';
      case 'sad': return '/assets/characters/rich_sad.png';
      default: return '/assets/characters/rich_neutral.png';
    }
  };

  const getThemeColor = () => {
    switch (emotion) {
      case 'happy': return 'text-[#0351FF] bg-blue-50 border-blue-100';
      case 'angry': return 'text-[#FF3B30] bg-red-50 border-red-100';
      case 'sad': return 'text-[#8E8E93] bg-gray-50 border-gray-100';
      default: return 'text-[#1C1C1E] bg-[#F2F4F7] border-gray-200';
    }
  };

  return (
    <div className="w-full flex flex-col items-center mb-4 animate-samsung-up">
      {!hideImage && (
        <div className="relative group mb-4">
          <div className="w-36 h-48 rounded-[32px] overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-white p-1 transition-transform duration-500 group-hover:scale-[1.02]">
            <div className={`w-full h-full rounded-[28px] overflow-hidden border-2 ${emotion === 'happy' ? 'border-blue-100' :
              emotion === 'angry' ? 'border-red-100' : 'border-gray-50'}`}>
              <img
                src={getEmotionImage()}
                alt={emotion}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
          <div className="absolute -bottom-3 inset-x-0 flex justify-center">
            <span className="bg-[#1A1F27] text-white text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full font-black shadow-xl ring-4 ring-white">
              {character === 'idol' ? '글로벌 아이돌' : character === 'chairman' ? '기업가' : character === 'sport' ? '스포츠 스타' : '자산가'}
            </span>
          </div>
        </div>
      )}

      <div className={`relative w-full flex justify-center ${hideImage ? 'mt-2' : 'mt-6'}`}>
        <div className="bg-white px-7 py-5 rounded-[28px] rounded-tl-[4px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white max-w-[90%] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0351FF]"></div>
          <p className="text-[#1A1F27] font-bold leading-relaxed whitespace-pre-line break-keep text-[15px]">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};