import { RoundScenario, StockId, Portfolio } from './types';

export const STOCK_LIST: { id: StockId; name: string; sector: string; logo: string }[] = [
  { id: StockId.SAMSUNG, name: '삼성전자', sector: '반도체', logo: '/assets/ticker/삼성전자.png' },
  { id: StockId.NAVER, name: '네이버', sector: 'IT/플랫폼', logo: '/assets/ticker/네이버.png' },
  { id: StockId.CELLTRION, name: '셀트리온', sector: '바이오', logo: '/assets/ticker/셀트리온.png' },
  { id: StockId.HANWHA, name: '한화에어로스페이스', sector: '방산/항공우주', logo: '/assets/ticker/한화에어로스페이스.png' },
  { id: StockId.TESLA, name: '테슬라', sector: '전기차', logo: '/assets/ticker/테슬라.png' },
  { id: StockId.NVIDIA, name: '엔비디아', sector: 'AI 반도체', logo: '/assets/ticker/엔비디아.png' },
  { id: StockId.KB, name: 'KB금융', sector: '금융', logo: '/assets/ticker/KB금융.png' },
  { id: StockId.KODEX_GOLD, name: 'KODEX 금액티브', sector: '원자재', logo: '/assets/ticker/KODEX금액티브.png' },
  { id: StockId.AMORE, name: '아모레퍼시픽', sector: '화장품/소비재', logo: '/assets/ticker/아모레퍼시픽.png' },
  { id: StockId.SAMYANG, name: '삼양식품', sector: '식음료', logo: '/assets/ticker/삼양식품.png' },
  { id: StockId.HANATOUR, name: '하나투어', sector: '여행/레저', logo: '/assets/ticker/하나투어.png' },
  { id: StockId.KOREAN_AIR, name: '대한항공', sector: '항공/운송', logo: '/assets/ticker/대한항공.png' },
  { id: StockId.HYUNDAI_HEAVY, name: 'HD현대중공업', sector: '조선/중공업', logo: '/assets/ticker/HD현대중공업.png' },
  { id: StockId.NETFLIX, name: '넷플릭스', sector: 'OTT/콘텐츠', logo: '/assets/ticker/넷플릭스.png' },
];

export const ROUNDS: RoundScenario[] = [
  {
    id: 1,
    title: 'ROUND 1. 글로벌 금리 인상기',
    description: `속보가 이어진다.
“기준금리 추가 인상.”

물가는 쉽게 잡히지 않고,
중앙은행은 강한 긴축을 예고한다.

증시는 방향을 잡지 못한 채 흔들린다.
낙관과 불안이 하루 만에 뒤바뀐다.

지금이 조정의 구간인지, 하락의 시작인지, 판단은 PB의 몫이다.`,
    subDescription: [
      '증시는 방향을 잡지 못한 채 흔들린다.',
      '낙관과 불안이 하루 만에 뒤바뀐다.',
      '지금이 조정의 구간인지, 하락의 시작인지, 판단은 PB의 몫입니다.'
    ],
    marketCondition: {
      cashReturn: 0.04, // 현금 보유 메리트 상승
      stockReturns: {
        [StockId.KB]: 0.10,           // 금리 수혜
        [StockId.KODEX_GOLD]: 0.06,   // 금 가격 상승
        [StockId.SAMSUNG]: -0.02,      // 대형주 횡보/소폭하락
        [StockId.NVIDIA]: -0.03,       // 기술주 압박
        [StockId.NAVER]: -0.12,        // 성장주 직격탄
        [StockId.TESLA]: -0.15,        // 고평가 성장주 하락
      } as any,
    },
    keyFocus: '금리 인상기에는 금융주가 방어적인 성격을 띠곤 하죠. 성장주들의 하락세를 어떻게 방어할지가 관건입니다.',
  },
  {
    id: 2,
    title: 'ROUND 2. AI 수요 폭발 & 기술주 랠리',
    description: `대형 IT 기업이 예상 밖의 실적을 발표한다.
AI 산업에 자금이 몰린다.

주가는 연일 신고가를 경신하고,
시장에는 낙관이 가득하다.

“이번에는 다르다”는 말이 반복된다.

지금이 거대한 기회의 시작인지, 과열의 정점인지, 판단은 PB의 몫이다.`,
    subDescription: [
      '주가는 연일 신고가를 경신하고, 시장에는 낙관이 가득하다.',
      '“이번에는 다르다”는 말이 반복된다.',
      '지금이 거대한 기회의 시작인지, 과열의 정점인지, 판단은 PB의 몫입니다.'
    ],
    marketCondition: {
      cashReturn: 0.01,
      stockReturns: {
        [StockId.NVIDIA]: 0.35,       // AI 대장주 폭등
        [StockId.SAMSUNG]: 0.25,      // 반도체 동반 상승
        [StockId.TESLA]: 0.18,        // 자율주행/AI 테마
        [StockId.NAVER]: 0.10,        // 플랫폼 기대감
        [StockId.SAMYANG]: -0.08,     // 자금 소외
        [StockId.AMORE]: -0.10,       // 자금 소외
      } as any,
    },
    keyFocus: 'AI 기술주들의 랠리가 무섭습니다. 과감한 베팅으로 수익률을 끌어올려 보세요!',
  },
  {
    id: 3,
    title: 'ROUND 3. 지정학적 리스크 (전쟁 발발)',
    description: `새벽 긴급 뉴스가 전해진다.
특정 지역에서 무력 충돌이 발생했다.

원자재 가격과 환율이 급등하고,
증시는 개장과 동시에 급락한다.

공포는 빠르게 확산된다.

지금이 일시적 충격인지, 구조적 위기의 신호인지, 판단은 PB의 몫이다.`,
    subDescription: [
      '원자재 가격과 환율이 급등하고, 증시는 개장과 동시에 급락한다.',
      '공포는 빠르게 확산된다.',
      '방산 섹터에 대한 시장의 관심이 급증합니다.'
    ],
    marketCondition: {
      cashReturn: 0.02,
      stockReturns: {
        [StockId.HANWHA]: 0.20,       // 방산 수요 폭발
        [StockId.KODEX_GOLD]: 0.15,   // 안전자산 선호
        [StockId.HYUNDAI_HEAVY]: 0.08, // 에너지 수송 수요 기대
        [StockId.SAMSUNG]: -0.05,      // 지수 하락 여파
        [StockId.HANATOUR]: -0.30,     // 여행 중단 (치명타)
        [StockId.KOREAN_AIR]: -0.25,   // 유가 급등 + 운항 차질
      } as any,
    },
    keyFocus: '전쟁은 여행과 항공업계에 큰 타격을 주지만, 방산과 금 같은 안전자산에는 기회가 될 수 있습니다.',
  },
  {
    id: 4,
    title: 'ROUND 4. 글로벌 팬데믹',
    description: `감염병이 전 세계로 확산된다.
도시는 멈추고, 시장은 크게 흔들린다.

시간이 흐르며 각국은 전례 없는 대응책을 내놓는다.
증시는 급락과 반등을 반복한다.

지금이 기회인지, 또 한 번의 함정인지, 판단은 PB의 몫이다.`,
    subDescription: [
      '시간이 흐르며 각국은 전례 없는 대응책을 내놓는다. 증시는 급락과 반등을 반복한다.',
      '지금이 기회인지, 또 한 번의 함정인지, 판단은 PB의 몫입니다.'
    ],
    marketCondition: {
      cashReturn: 0.01,
      stockReturns: {
        [StockId.CELLTRION]: 0.25,    // 바이오/치료제 수혜
        [StockId.NETFLIX]: 0.22,      // 홈 엔터테인먼트 급증
        [StockId.NAVER]: 0.15,        // 비대면 쇼핑/플랫폼
        [StockId.SAMYANG]: 0.10,      // 비상식량/내수 소비
        [StockId.HYUNDAI_HEAVY]: -0.20, // 글로벌 제조 중단
        [StockId.HANATOUR]: -0.40,     // 국경 봉쇄 (최악의 국면)
      } as any,
    },
    keyFocus: '팬데믹 상황에서는 바이오와 언택트 관련주들이 강세를 보입니다. 전통 제조/중화학 산업의 위기를 어떻게 피해갈지 결정하세요.',
  },
];

export const INITIAL_PORTFOLIO: Portfolio = {
  cashRatio: 30,
  stockRatio: 70,
  stockAllocation: {
    [StockId.SAMSUNG]: 20,
    [StockId.NVIDIA]: 20,
    [StockId.KB]: 20,
    [StockId.HANWHA]: 20,
    [StockId.CELLTRION]: 10,
    [StockId.NAVER]: 10,
  } as any,
};