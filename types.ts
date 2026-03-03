export enum StockId {
  SAMSUNG = 'Samsung',
  NAVER = 'Naver',
  CELLTRION = 'Celltrion',
  HANWHA = 'Hanwha',
  TESLA = 'Tesla',
  NVIDIA = 'Nvidia',
  KB = 'KB',
  KODEX_GOLD = 'KodexGold',
  AMORE = 'Amore',
  SAMYANG = 'Samyang',
  HANATOUR = 'Hanatour',
  KOREAN_AIR = 'KoreanAir',
  HYUNDAI_HEAVY = 'HyundaiHeavy',
  NETFLIX = 'Netflix'
}

export interface RoundScenario {
  id: number;
  title: string;
  description: string;
  subDescription: string[]; // Bullet points
  marketCondition: {
    cashReturn: number; // e.g., 0.05 for 5%
    stockReturns: Record<StockId, number>; // Return rate for each stock in this round
  };
  keyFocus: string; // "판단 포인트" for UI
}

export interface Portfolio {
  cashRatio: number; // 0 to 100
  stockRatio: number; // 0 to 100
  stockAllocation: Record<StockId, number>; // Weights relative to each other (will be normalized to 100%)
}

export interface GameState {
  currentRound: number; // 0 to 4 (5 rounds)
  totalScore: number; // Accumulation of satisfaction
  currentPortfolio: Portfolio;
  currentTotalAssets: number; // Current assets in KRW
  history: {
    roundId: number;
    profitRate: number;
    assetsAfter: number;
    satisfactionScore: number;
    comment: string;
  }[];
  isGameOver: boolean;
  selectedCharacter: 'rich' | 'idol' | 'chairman' | 'sport' | 'heir' | 'newly';
}