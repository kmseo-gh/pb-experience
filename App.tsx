import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { ChevronRight, RefreshCcw, TrendingUp, AlertTriangle, CheckCircle, Briefcase, User, DollarSign } from 'lucide-react';
import { ROUNDS, INITIAL_PORTFOLIO, STOCK_LIST } from './constants';
import { GameState, Portfolio, StockId, RoundScenario } from './types';
import { ChairmanBot } from './components/ChairmanBot';

// --- Helper Functions ---

const formatWon = (val: number) => {
    const uk = Math.floor(val / 100000000);
    return `${uk.toLocaleString()}억`;
};

const formatWonDiff = (val: number) => {
    const uk = Math.floor(val / 100000000);
    const sign = uk > 0 ? '+' : '';
    return `${sign}${uk.toLocaleString()}억`;
};

// --- Helper Components ---

const Header: React.FC<{ round: number; totalRounds: number; assets: number }> = ({ round, totalRounds, assets }) => (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100/50 shadow-sm transition-all duration-300 w-full">
        <div className="w-full px-5 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <img src="/assets/icons/icon.png" className="w-11 h-11 object-contain" alt="Logo" />
                <div className="flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-0.5">Portfolio Value</span>
                    <span className="font-black text-[#1A1F27] text-[22px] leading-tight tracking-tight">{formatWon(assets)}</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <div className="text-[11px] font-black text-[#0351FF] bg-blue-50 border border-blue-100/50 px-3.5 py-1.5 rounded-full tracking-tight shadow-sm">
                    {round > totalRounds ? 'COMPLETE' : `R${round} / ${totalRounds}`}
                </div>
            </div>
        </div>
    </header>
);

const RangeSlider: React.FC<{
    label: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    step?: number;
    subLabel?: string;
    logo?: string;
    colorClass?: string;
}> = ({ label, value, onChange, min = 0, max = 100, step = 1, subLabel, logo }) => (
    <div className="mb-8 last:mb-0">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
                {logo && (
                    <div className="w-10 h-10 rounded-full border border-gray-100 overflow-hidden bg-white shadow-sm flex-shrink-0">
                        <img src={logo} alt={label} className="w-full h-full object-contain p-1" />
                    </div>
                )}
                <span className="font-bold text-[#1A1F27] text-[15px] tracking-tight">{label}</span>
            </div>
            <span className="text-[17px] font-black text-[#0351FF] tracking-tighter">{subLabel || `${value}%`}</span>
        </div>
        <div className="px-1">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full"
            />
        </div>
    </div>
);

const StockGridSlider: React.FC<{
    label: string;
    value: number;
    onChange: (val: number) => void;
    logo?: string;
    subLabel: string;
}> = ({ label, value, onChange, subLabel, logo }) => (
    <div className="bg-white border border-gray-100 rounded-[24px] p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow duration-300">
        {logo && (
            <div className="w-12 h-12 rounded-full border border-gray-50 overflow-hidden bg-white mb-3 flex-shrink-0 shadow-inner">
                <img src={logo} alt={label} className="w-full h-full object-contain p-1.5" />
            </div>
        )}
        <span className="font-bold text-[#1A1F27] text-[13px] tracking-tight mb-1 truncate w-full">{label}</span>
        <span className="text-[15px] font-black text-[#0351FF] tracking-tighter">{subLabel}</span>
        <div className="w-full px-1">
            <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#0351FF]"
            />
        </div>
    </div>
);

// --- Main App ---

const App: React.FC = () => {
    // --- State ---
    const [gameState, setGameState] = useState<GameState>({
        currentRound: 0, // 0 = Intro, 1-4 = Game, 5 = Ending
        totalScore: 0,
        currentPortfolio: { ...INITIAL_PORTFOLIO },
        currentTotalAssets: 100000000000, // 1000억 Start
        history: [],
        isGameOver: false,
        selectedCharacter: 'rich', // Default
    });

    const [step, setStep] = useState<'SCENARIO' | 'ALLOC_ASSET' | 'ALLOC_STOCK' | 'RESULT'>('SCENARIO');
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

    // Temporary state for the current round's decision
    const [tempPortfolio, setTempPortfolio] = useState<Portfolio>({ ...INITIAL_PORTFOLIO });

    // --- Effects ---
    useEffect(() => {
        if (currentScenario) {
            const activeStockIds = Object.keys(currentScenario.marketCondition.stockReturns) as StockId[];
            const initialAllocation: Record<StockId, number> = {} as any;
            activeStockIds.forEach(id => {
                initialAllocation[id] = 10; // Default weight for active stocks
            });
            setTempPortfolio(prev => ({
                ...prev,
                stockAllocation: initialAllocation
            }));
        }
    }, [gameState.currentRound]);

    // --- Helper Functions ---
    const showToast = (message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    const openSamsungPop = () => {
        const userAgent = navigator.userAgent.toLowerCase();
        const isAndroid = userAgent.indexOf("android") > -1;
        const isIos = /iphone|ipad|ipod/.test(userAgent);

        const iosUrl = "https://apps.apple.com/kr/app/%EC%82%BC%EC%84%B1%EC%A6%9D%EA%B6%8C-mpop/id1150231646?ppid=31b3b594-5890-4228-877d-be81cf90bb77";
        const androidUrl = "https://play.google.com/store/apps/details?id=com.samsungpop.android.mpop";

        if (isAndroid) {
            window.location.href = androidUrl;
        } else if (isIos) {
            window.location.href = iosUrl;
        } else {
            window.open(iosUrl, "_blank");
        }
    };

    const getGlobalEmotion = (score: number) => {
        if (score >= 80) return 'happy';
        if (score >= 60) return 'neutral';
        if (score >= 40) return 'sad';
        return 'angry';
    };

    // --- Derived Data ---
    const currentScenario = ROUNDS.find((r) => r.id === gameState.currentRound);

    // --- Logic Helpers ---

    const calculateStockPercentages = (rawAllocation: Record<StockId, number>) => {
        const totalWeight = Object.values(rawAllocation).reduce((a, b) => a + b, 0);
        const result: Partial<Record<StockId, number>> = {};

        // Avoid division by zero
        const safeTotal = totalWeight === 0 ? 1 : totalWeight;

        (Object.keys(rawAllocation) as StockId[]).forEach(key => {
            result[key] = (rawAllocation[key] / safeTotal) * 100;
        });
        return result as Record<StockId, number>;
    };

    const evaluateRound = () => {
        if (!currentScenario) return;

        // 1. Calculate Profit Rate
        const stockP = tempPortfolio.stockRatio / 100;
        const cashP = tempPortfolio.cashRatio / 100;

        // Normalized stock weights (must sum to 1 within the stock portion)
        const normalizedStocks = calculateStockPercentages(tempPortfolio.stockAllocation);

        let weightedStockReturn = 0;
        (Object.keys(normalizedStocks) as StockId[]).forEach(key => {
            const weight = normalizedStocks[key] / 100;
            const ret = currentScenario.marketCondition.stockReturns[key] || 0;
            weightedStockReturn += weight * ret;
        });

        const totalReturn = (stockP * weightedStockReturn) + (cashP * currentScenario.marketCondition.cashReturn);
        const profitPercent = totalReturn * 100;

        // 2. Calculate Asset Change
        const currentAssets = gameState.currentTotalAssets;
        const profitAmount = currentAssets * totalReturn;
        const nextAssets = Math.floor(currentAssets + profitAmount);

        // 3. Chairman Satisfaction & Comment Logic (Profit-Based)
        let satisfaction = 0;
        let comment = "";

        // Tier Determination
        if (profitPercent >= 5) {
            satisfaction = 95;
            comment = "수익률이 아주 예술이야. 자네가 사고 싶다던 그 차, 오늘 계약하러 가게.";
        } else if (profitPercent >= 0) {
            satisfaction = 75;
            comment = "소소하구먼. 오늘 점심은 가볍게 스테이크 정도로 하지.";
        } else if (profitPercent >= -5) {
            satisfaction = 50;
            comment = "오늘 내 커피 한 잔 값이 사라졌군. 자네, 내일은 스테이크 값을 벌어와야 할 거야.";
        } else {
            satisfaction = 20;
            comment = "자네, 사막의 밤이 왜 무서운지 아나? 지금 내 기분이 딱 그렇군.";
        }

        // Scenario Specific logic & Bonuses
        const { id } = currentScenario;
        if (id === 1) { // Round 1: Rate Hike
            if (tempPortfolio.stockRatio > 90) {
                satisfaction = Math.min(satisfaction, 30);
                comment = "자네, 사막의 밤이 왜 무서운지 아나? 지금 내 기분이 딱 그렇군.";
            }
        } else if (id === 2) { // Round 2: AI Rally
            if (normalizedStocks[StockId.NVIDIA] > 20 && profitPercent > 0) {
                satisfaction = Math.min(satisfaction + 5, 100);
                comment = "AI 대장주를 낚아채는 솜씨가 아주 예술이야. 자네가 사고 싶다던 그 차, 오늘 계약하러 가게.";
            } else if (tempPortfolio.stockRatio < 50) {
                satisfaction = Math.max(satisfaction - 10, 0);
                comment = "시장이 이렇게 불타는데 겨우 커피값이나 벌어오다니... 자네, 사막의 밤이 왜 무서운지 아나?";
            }
        } else if (id === 3) { // Round 3: Geopolitics (War)
            if (normalizedStocks[StockId.HANWHA] > 20 && profitPercent > 0) {
                satisfaction = Math.min(satisfaction + 5, 100);
                comment = "방산주로 리스크를 예술적으로 방어했군! 오늘 당장 차 계약하러 가게나.";
            } else if (tempPortfolio.stockRatio > 80) {
                satisfaction = Math.min(satisfaction, 20);
                comment = "자네, 사막의 밤이 왜 무서운지 아나? 지금 내 기분이 딱 그렇군.";
            }
        } else if (id === 4) { // Round 4: Pandemic
            if ((normalizedStocks[StockId.CELLTRION] > 15 || normalizedStocks[StockId.NETFLIX] > 15) && profitPercent > 0) {
                satisfaction = Math.min(satisfaction + 5, 100);
                comment = "포트폴리오 구성이 아주 예술이야! 오늘 당장 그 차 계약하러 가게.";
            } else if (tempPortfolio.stockRatio < 30) {
                satisfaction = Math.max(satisfaction - 10, 0);
                comment = "반등 기회에 커피값이나 벌고 있다니... 지금 내 기분은 사막의 밤보다 더 차갑군.";
            }
        }

        // Cap Score
        if (satisfaction > 100) satisfaction = 100;
        if (satisfaction < 0) satisfaction = 0;

        // Save Result
        setGameState(prev => ({
            ...prev,
            totalScore: prev.totalScore + satisfaction,
            currentTotalAssets: nextAssets,
            history: [
                ...prev.history,
                {
                    roundId: prev.currentRound,
                    profitRate: parseFloat(profitPercent.toFixed(2)),
                    assetsAfter: nextAssets,
                    satisfactionScore: satisfaction,
                    comment
                }
            ]
        }));

        setStep('RESULT');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const nextRound = () => {
        if (gameState.currentRound >= 4) {
            setGameState(prev => ({ ...prev, currentRound: 5 })); // Go to ending
        } else {
            setGameState(prev => ({ ...prev, currentRound: prev.currentRound + 1 }));
            setStep('SCENARIO');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- Handlers ---

    const handleStart = () => {
        if (gameState.selectedCharacter !== 'rich') {
            const messages: Record<string, string> = {
                sport: "송운동님은 현재 훈련 중입니다! 천수르님의 포트폴리오를 먼저 관리해 보시겠어요?",
                chairman: "나대표님은 현재 신규 사업 구상 중입니다! 지금은 PB로서 역량을 발휘해 보세요.",
                idol: "엘라님은 글로벌 월드 투어 중입니다! 천수르님의 자산을 먼저 불려주시는 건 어떨까요?",
                heir: "박재벌님은 경영 수업 중입니다! 천수르님의 자산을 먼저 관리해 보세요.",
                newly: "김졸부님은 현재 여행 중입니다! 천수르님의 자산을 먼저 불려주시는 건 어떨까요?"
            };
            showToast(messages[gameState.selectedCharacter] || "준비 중인 캐릭터입니다.");
            setGameState(prev => ({ ...prev, selectedCharacter: 'rich' }));
            return;
        }
        setGameState(prev => ({ ...prev, currentRound: 1 }));
        setStep('SCENARIO');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAssetChange = (stockPercent: number) => {
        setTempPortfolio(prev => ({
            ...prev,
            stockRatio: stockPercent,
            cashRatio: 100 - stockPercent
        }));
    };

    const handleStockWeightChange = (id: StockId, weight: number) => {
        setTempPortfolio(prev => ({
            ...prev,
            stockAllocation: {
                ...prev.stockAllocation,
                [id]: weight
            }
        }));
    };

    // --- Rendering ---

    // --- Rendering Helpers ---

    const renderIntro = () => (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-samsung-up">
            <div className="w-full samsung-card p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

                {/* Intro Content */}
                <div className="w-36 h-36 mx-auto mb-4 relative z-10">
                    <img src="/assets/icons/icon.png" className="w-full h-full object-contain drop-shadow-2xl" alt="Logo" />
                </div>

                <h1 className="text-[32px] font-black text-[#1A1F27] mb-3 tracking-tighter leading-tight relative z-10">두근두근‼️<br />억만장자 키우기</h1>
                <p className="text-slate-500 font-medium mb-6 text-[16px] leading-relaxed relative z-10">
                    당신은 <span className="text-[#0351FF] font-bold">삼성증권</span>의 <span className="text-[#0351FF] font-bold">VIP 전담 PB</span>입니다.<br />
                    매 라운드마다 바뀌는 경제 상황!<br />
                    당신의 선택이 VIP의 미래를 결정합니다.<br /><br />
                    <span className="text-[#0351FF] font-bold">1. 자산 배분:</span> <br />제한된 종목에서 자산 비중을 최적화하세요.<br />
                    <span className="text-[#0351FF] font-bold">2. 고객 선택:</span> <br />당신의 운명을 함께할 VIP를 선택하세요!<br />
                </p>

                <div className="grid grid-cols-3 gap-3 mb-10 relative z-10">
                    {[
                        { id: 'rich', name: '천수르', role: '초고액자산가', img: '/assets/characters/rich_neutral.png', available: true },
                        { id: 'sport', name: '송운동', role: '스포츠스타', img: '/assets/characters/sport_neutral.png', available: false },
                        { id: 'heir', name: '박재벌', role: '재벌3세', img: '/assets/characters/heir_neutral.png', available: false },
                        { id: 'idol', name: '엘라', role: '아이돌', img: '/assets/characters/idol_neutral.png', available: false },
                        { id: 'newly', name: '김졸부', role: '벼락부자', img: '/assets/characters/newly_neutral.png', available: false },
                        { id: 'chairman', name: '나대표', role: 'CEO', img: '/assets/characters/chairman_neutral.png', available: false }
                    ].map((char) => (
                        <div
                            key={char.id}
                            onClick={() => setGameState(prev => ({ ...prev, selectedCharacter: char.id as any }))}
                            className={`group cursor-pointer rounded-[32px] border-2 transition-all duration-300 p-1.5 relative ${gameState.selectedCharacter === char.id
                                ? 'border-[#0351FF] bg-blue-50/30 shadow-xl shadow-blue-500/5'
                                : 'border-white bg-white shadow-sm hover:border-gray-200 hover:shadow-md'
                                }`}
                        >
                            <div className="aspect-[1/1] rounded-[24px] overflow-hidden mb-3 bg-gray-50 border border-gray-100 relative">
                                <img src={char.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={char.name} />
                            </div>
                            <div className="text-left px-2 mb-1">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">{char.role}</p>
                                <h3 className="text-[14px] font-black text-[#1A1F27] tracking-tight">{char.name}</h3>
                            </div>
                            {gameState.selectedCharacter === char.id && (
                                <div className="absolute top-4 right-4 w-6 h-6 bg-[#0351FF] rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleStart}
                    className="samsung-btn-primary w-full py-5 text-[18px] flex items-center justify-center gap-3 relative z-10 shadow-2xl shadow-blue-500/20"
                >
                    시뮬레이션 시작 <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <div className="mt-8 text-center space-y-1 relative z-10">
                <p className="text-[10px] text-gray-400 font-bold tracking-widest">Samsung Securities PB Simulation</p>
                <p className="text-[9px] text-gray-400/60 font-medium">본 서비스는 가상 시뮬레이션이며, 실존 인물의 실제 판단과 무관합니다.</p>
            </div>
        </div>
    );

    const renderEnding = () => {
        const avgScore = Math.round(gameState.totalScore / 4);
        const finalAssets = gameState.currentTotalAssets;
        const initialAssets = 100000000000;
        const profit = finalAssets - initialAssets;
        const isProfit = profit >= 0;

        const getFinalComment = () => {
            if (avgScore >= 80) return "자네 정말 수고했네! 이번에 보여준 근거 있는 판단만큼, 다음에도 이런 근거 있는 선택을 기대하겠네.";
            if (avgScore >= 60) return "수익은 어느 정도 거두었군. 시장 흐름에 잘 대응했지만, 좀 더 공격적인 운용 전략이 있었다면 하는 아쉬움이 있네.";
            if (avgScore >= 40) return "PB님, 제 자산이 장난입니까? 실험은 삼가시죠. 좀 더 신중하게 하게.";
            return "실망이 크네... 자네는 PB의 기본인 '리스크 관리'부터 다시 공부하고 오게나.";
        };

        return (
            <div className="flex-1 flex flex-col -mt-5 -mx-5 animate-samsung-up">
                <Header round={5} totalRounds={4} assets={finalAssets} />
                <div className="flex-1 p-5 w-full">
                    <div className="samsung-card bg-white border border-gray-100 shadow-2xl relative overflow-hidden p-0">
                        {/* Report Header */}
                        <div className="bg-[#1A1F27] p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <span className="text-[10px] font-black tracking-[0.25em] text-blue-400 uppercase mb-1 block">PB PERFORMANCE REPORT</span>
                                <div className="flex justify-between items-end">
                                    <h2 className="text-[24px] font-black tracking-tighter leading-none">운용 성과 보고서</h2>
                                    <span className="text-[11px] text-gray-400 font-bold uppercase tabular-nums">NO. {new Date().getTime().toString().slice(-8)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-7">
                            {/* Client Summary */}
                            <div className="flex gap-5 mb-8 items-start">
                                <div className="relative flex-shrink-0">
                                    <div className={`w-24 h-32 rounded-[24px] overflow-hidden border-2 bg-gray-50 shadow-md ${avgScore >= 60 ? 'border-red-100' : 'border-blue-100'}`}>
                                        <img
                                            src={gameState.selectedCharacter === 'rich'
                                                ? (avgScore >= 80 ? '/assets/characters/rich_happy.png' : avgScore >= 60 ? '/assets/characters/rich_neutral.png' : avgScore >= 40 ? '/assets/characters/rich_sad.png' : '/assets/characters/rich_angry.png')
                                                : `/assets/characters/${gameState.selectedCharacter}_neutral.png`}
                                            alt="Client"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2">
                                        <div className={`w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${avgScore >= 80 ? 'bg-[#FF3B30]' : avgScore >= 40 ? 'bg-[#0351FF]' : 'bg-gray-400'}`}>
                                            <span className="text-white text-[10px] font-black italic">PB</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 pt-1">
                                    <div className="mb-3">
                                        <span className="bg-[#F2F4F7] text-[#1A1F27] text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase mb-1.5 inline-block">CLIENT PROFILE</span>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[20px] font-black text-[#1A1F27] tracking-tight">
                                                {gameState.selectedCharacter === 'idol' ? '엘라' : 
                                                 gameState.selectedCharacter === 'chairman' ? '나대표' : 
                                                 gameState.selectedCharacter === 'sport' ? '송운동' : 
                                                 gameState.selectedCharacter === 'heir' ? '박재벌' :
                                                 gameState.selectedCharacter === 'newly' ? '김졸부' : '천수르'}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="bg-[#F8FAFC] p-3 rounded-[16px] border border-gray-50 relative">
                                        <div className="absolute -top-1.5 left-3 w-3 h-3 bg-[#F8FAFC] border-l border-t border-gray-50 transform rotate-45"></div>
                                        <p className="text-[13px] font-bold text-slate-500 leading-tight break-keep italic">
                                            "{getFinalComment()}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Core Performance Table */}
                            <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100 rounded-[28px] overflow-hidden mb-8 shadow-sm">
                                <div className="bg-white p-5 flex flex-col items-center">
                                    <span className="text-[10px] text-gray-400 font-black mb-1.5 uppercase tracking-widest">운용 만족도</span>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className={`text-[36px] font-black tracking-tighter leading-none ${avgScore >= 80 ? 'text-[#FF3B30]' : 'text-[#1A1F27]'}`}>{avgScore}</span>
                                        <span className="text-gray-300 font-bold text-sm tracking-tighter">/100</span>
                                    </div>
                                </div>
                                <div className="bg-white p-5 flex flex-col items-center">
                                    <span className="text-[10px] text-gray-400 font-black mb-1.5 uppercase tracking-widest">누적 수익금</span>
                                    <span className={`text-[18px] font-black tracking-tighter leading-none pt-2 ${isProfit ? 'text-[#FF3B30]' : 'text-[#0351FF]'}`}>
                                        {formatWonDiff(profit)}
                                    </span>
                                </div>
                                <div className="bg-white p-5 flex flex-col items-center col-span-2 border-t border-gray-50">
                                    <span className="text-[10px] text-gray-400 font-black mb-1 uppercase tracking-widest">최종 자산 총액</span>
                                    <span className="text-[24px] font-black text-[#1A1F27] tracking-tighter">{formatWon(finalAssets)}</span>
                                </div>
                            </div>

                            {/* Final Asset Comparison (Simplified Bar Chart) */}
                            <div className="mb-8">
                                <div className="flex justify-between items-end mb-2 px-1">
                                    <span className="text-[10px] text-gray-400 font-black tracking-widest uppercase">ASSET GROWTH</span>
                                    <span className={`text-[11px] font-bold ${isProfit ? 'text-red-500' : 'text-blue-500'}`}>
                                        {((profit / initialAssets) * 100).toFixed(1)}% {isProfit ? '증가' : '감소'}
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-slate-300 w-1/2 border-r border-white/20"></div>
                                    <div className={`h-full ${isProfit ? 'bg-[#FF3B30]' : 'bg-[#0351FF]'}`} style={{ width: `${Math.min(50, Math.abs((profit / initialAssets) * 50))}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-1.5 px-1 text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
                                    <span>INITIAL (1,000억)</span>
                                    <span>FINAL ({formatWon(finalAssets)})</span>
                                </div>
                            </div>

                            {/* Investment Ledger (History) */}
                            <div className="mb-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-[1px] flex-1 bg-gray-100"></div>
                                    <span className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">운용 기록 히스토리</span>
                                    <div className="h-[1px] flex-1 bg-gray-100"></div>
                                </div>
                                <div className="space-y-1.5">
                                    {gameState.history.map((h, idx) => {
                                        const prev = idx === 0 ? 100000000000 : gameState.history[idx - 1].assetsAfter;
                                        const diff = h.assetsAfter - prev;
                                        return (
                                            <div key={idx} className="flex justify-between items-center group">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-gray-200 tabular-nums">0{h.roundId}</span>
                                                    <span className="text-[13px] font-bold text-slate-500">
                                                        {ROUNDS.find(r => r.id === h.roundId)?.title.split('. ')[1] || '시장 대응'}
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-[12px] font-bold text-gray-300 tabular-nums">{formatWon(h.assetsAfter)}</span>
                                                    <span className={`text-[13px] font-black w-14 text-right tabular-nums ${diff >= 0 ? 'text-[#FF3B30]' : 'text-[#0351FF]'}`}>
                                                        {formatWonDiff(diff)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Samsung Beratung / CTA */}
                            <div className="p-1 rounded-[32px] bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl shadow-blue-500/20">
                                <div className="bg-white/10 backdrop-blur-sm rounded-[30px] p-6 text-center border border-white/20">
                                    <p className="text-white/90 text-[14px] font-bold mb-5 leading-tight tracking-tight break-keep">
                                        두근두근 자산 관리, 이제 시작하세요!<br />
                                        mPOP과 함께라면 투자도 더 쉽고 즐거워집니다.
                                    </p>
                                    <button
                                        onClick={openSamsungPop}
                                        className="bg-white text-blue-600 w-full py-4 rounded-[20px] text-[16px] font-black shadow-lg hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center gap-2"
                                    >
                                        삼성증권 mPOP 앱 다운로드<ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="text-center p-6 bg-gray-50/50">
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed opacity-60">
                                본 시뮬레이션의 결과는 가상의 데이터이며 실제 투자 수익을 보장하지 않습니다.<br />
                                삼성증권 mPOP을 통해 더 많은 가치를 확인해 보세요.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full mt-6 py-4 text-[13px] font-bold text-gray-400 flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" /> 다시 도전하기
                    </button>
                </div>
            </div>
        );
    };

    // --- Main Game Loops ---

    const renderScenario = () => (
        <div className="animate-samsung-up">
            <div className="mb-10">
                <span className="text-[#0351FF] font-black text-[12px] uppercase tracking-[0.2em] mb-3 block">오늘의 시장 소식</span>

                {/* Round Illustration */}
                <div className="w-full flex justify-center mb-4">
                    <div className="w-3/4 aspect-[4/3] rounded-[24px] overflow-hidden bg-white shadow-xl border border-gray-100">
                        <img
                            src={`/assets/round/round_${gameState.currentRound}.png`}
                            className="w-full h-full object-cover"
                            alt="Round Illustration"
                        />
                    </div>
                </div>

                <ChairmanBot message={currentScenario?.description || ''} character={gameState.selectedCharacter} hideImage={true} />

                <div className="bg-white border border-gray-100 p-4 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-3xl -mr-12 -mt-12"></div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-blue-50 rounded-[10px] flex items-center justify-center border border-blue-100">
                            <TrendingUp className="w-4 h-4 text-[#0351FF]" />
                        </div>
                        <span className="font-black text-[14px] text-[#1A1F27] tracking-tight">전략 힌트</span>
                    </div>
                    <p className="text-slate-500 text-[13px] leading-relaxed font-medium break-keep ml-9">{currentScenario?.keyFocus}</p>
                </div>

                <button
                    onClick={() => {
                        setStep('ALLOC_ASSET');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="samsung-btn-primary w-full py-5 text-[17px] flex items-center justify-center gap-3"
                >
                    전략 구성하기 <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const renderAssetAllocation = () => {
        const data = [
            { name: '주식', value: tempPortfolio.stockRatio, color: '#0351FF' },
            { name: '현금', value: tempPortfolio.cashRatio, color: '#E5E7EB' },
        ];

        return (
            <div className="animate-samsung-up">
                <div className="mb-10 text-center">
                    <span className="text-[#0351FF] font-black text-[12px] uppercase tracking-[0.2em] mb-3 block">Step 01</span>
                    <h2 className="text-[26px] font-black text-[#1A1F27] leading-[1.2] mb-3 tracking-tight">투자 비중 정하기</h2>
                    <p className="text-gray-400 text-[15px] font-medium leading-relaxed">내 자산 <span className="text-[#1A1F27] font-black underline underline-offset-4 decoration-blue-100">{formatWon(gameState.currentTotalAssets)}</span>을 어떻게 나눌까요?</p>
                </div>

                <div className="samsung-card p-10 mb-10 relative overflow-hidden">
                    <div className="h-48 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={65}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest mb-1">주식 비중</span>
                            <span className="text-[32px] font-black text-[#0351FF] tracking-tighter leading-none">{tempPortfolio.stockRatio}%</span>
                        </div>
                    </div>
                </div>

                <div className="samsung-card p-8 mb-10">
                    <RangeSlider
                        label="주식 투자 비중"
                        value={tempPortfolio.stockRatio}
                        onChange={handleAssetChange}
                    />
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-50">
                        <div className="flex flex-col">
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">나의 투자 성향</span>
                            <span className="text-[14px] font-black text-[#1A1F27]">
                                {tempPortfolio.stockRatio <= 30 ? '안정형' : tempPortfolio.stockRatio <= 70 ? '균형형' : '공격형'}
                            </span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">현금 비중</span>
                            <span className="text-[14px] font-black text-gray-400">{tempPortfolio.cashRatio}%</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setStep('ALLOC_STOCK');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="samsung-btn-primary w-full py-5 text-[17px] flex items-center justify-center gap-3"
                >
                    다음으로 <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        );
    };

    const renderStockAllocation = () => {
        const percentages = calculateStockPercentages(tempPortfolio.stockAllocation);

        return (
            <div className="animate-samsung-up">
                <div className="mb-6 text-center">
                    <span className="text-[#0351FF] font-black text-[12px] uppercase tracking-[0.2em] mb-3 block">Step 02</span>
                    <h2 className="text-[26px] font-black text-[#1A1F27] leading-[1.2] mb-3 tracking-tight">어떤 주식을 살까요?</h2>
                    <p className="text-gray-400 text-[15px] font-medium leading-relaxed">주식 비중 <span className="text-[#0351FF] font-black">{tempPortfolio.stockRatio}%</span>를 알차게 나눠보세요</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    {STOCK_LIST
                        .filter(stock => currentScenario?.marketCondition.stockReturns[stock.id] !== undefined)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((stock) => (
                            <StockGridSlider
                                key={stock.id}
                                label={stock.name}
                                subLabel={`${percentages[stock.id]?.toFixed(0)}%`}
                                logo={stock.logo}
                                value={tempPortfolio.stockAllocation[stock.id] || 0}
                                onChange={(val) => handleStockWeightChange(stock.id, val)}
                            />
                        ))}
                </div>

                <div className="bg-white/50 backdrop-blur-sm border border-gray-100 p-5 rounded-[24px] mb-4 flex gap-4 items-start shadow-sm">
                    <div className="w-10 h-10 bg-white rounded-[14px] flex items-center justify-center shadow-sm flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-[13px] text-gray-400 font-bold leading-normal break-keep">
                        종목별 슬라이더는 '가중치'입니다. 합계가 자동으로 <span className="text-[#1A1F27]">100%</span>가 되도록 계산됩니다.
                    </p>
                </div>

                <button
                    onClick={evaluateRound}
                    className="samsung-btn-primary w-full py-5 text-[17px] flex items-center justify-center gap-3"
                >
                    <CheckCircle className="w-5 h-5" />
                    검토 완료 (결과 확인)
                </button>
            </div>
        );
    };

    const renderResult = () => {
        const lastHistory = gameState.history[gameState.history.length - 1];
        const prevAssets = gameState.history.length > 1
            ? gameState.history[gameState.history.length - 2].assetsAfter
            : 100000000000;
        const diff = lastHistory.assetsAfter - prevAssets;

        return (
            <div className="animate-samsung-up text-center pb-8 flex flex-col items-center">
                <span className="text-[#0351FF] font-black text-[12px] uppercase tracking-[0.2em] mb-3 block">Round Result</span>
                <h2 className="text-[26px] font-black text-[#1A1F27] leading-[1.2] mb-1 tracking-tight">이번 라운드 결과</h2>
                <div className="w-12 h-1 bg-blue-100 rounded-full mb-8"></div>

                <ChairmanBot message={lastHistory.comment} emotion={getGlobalEmotion(lastHistory.satisfactionScore)} character={gameState.selectedCharacter} />

                <div className="grid grid-cols-2 gap-4 mb-10 w-full">
                    <div className="samsung-card p-6 flex flex-col items-center justify-center">
                        <span className="text-gray-400 text-[11px] font-bold block mb-2 uppercase tracking-widest leading-none">이번 라운드 수익</span>
                        <span className={`text-[20px] font-black tracking-tighter leading-none ${diff >= 0 ? 'text-[#FF3B30]' : 'text-[#0351FF]'}`}>
                            {formatWonDiff(diff)}
                        </span>
                        <span className={`block text-[11px] mt-1 font-bold ${lastHistory.profitRate >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                            ({lastHistory.profitRate > 0 ? '+' : ''}{lastHistory.profitRate}%)
                        </span>
                    </div>
                    <div className="samsung-card p-6 flex flex-col items-center justify-center">
                        <span className="text-gray-400 text-[11px] font-bold block mb-2 uppercase tracking-widest leading-none">현재 내 자산</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[20px] font-black text-[#1A1F27] tracking-tighter leading-none">{formatWon(lastHistory.assetsAfter)}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={nextRound}
                    className="samsung-btn-primary w-full py-5 text-[17px] flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20"
                >
                    {gameState.currentRound === 4 ? '최종 운용 리포트' : '다음 라운드 진행'} <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        );
    };

    return (
        <div className="mobile-view font-sans text-[#1A1F27] selection:bg-blue-100 flex flex-col min-h-screen">
            {gameState.currentRound > 0 && gameState.currentRound <= 4 && (
                <Header round={gameState.currentRound} totalRounds={4} assets={gameState.currentTotalAssets} />
            )}

            <main className="flex-1 p-5 overflow-x-hidden">
                {gameState.currentRound === 0 && renderIntro()}
                {gameState.currentRound > 0 && gameState.currentRound <= 4 && (
                    <>
                        {step === 'SCENARIO' && renderScenario()}
                        {step === 'ALLOC_ASSET' && renderAssetAllocation()}
                        {step === 'ALLOC_STOCK' && renderStockAllocation()}
                        {step === 'RESULT' && renderResult()}
                    </>
                )}
                {gameState.currentRound > 4 && renderEnding()}
            </main>

            {/* Toast Notification */}
            <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform w-[calc(100%-40px)] max-w-sm ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
                <div className="bg-[#1A1F27]/90 backdrop-blur-md text-white px-6 py-4 rounded-[24px] shadow-2xl border border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0351FF] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[14px] font-bold leading-tight break-keep">{toast.message}</p>
                </div>
            </div>
        </div>
    );
};

export default App;