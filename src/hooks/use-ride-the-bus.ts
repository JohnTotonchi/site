import { useState, useEffect, useCallback } from 'react';
import { getBalanceFromServer, updateBalanceOnServer, updateUsernameOnServer, getBalance } from '@/lib/balance-server';

interface Card {
  code: string;
  image: string;
  suit: string;
  value: string;
}

type GamePhase =
  | 'wager'
  | 'redblack'
  | 'higherlower'
  | 'inbetweenoutside'
  | 'picksuit'
  | 'result'
  | 'win';

interface GameState {
  phase: GamePhase;
  wager: number | null;
  currentBet: number;
  deckId: string | null;
  currentCard: Card | null;
  firstCard: Card | null;
  secondCard: Card | null;
  thirdCard: Card | null;
  previousCard: Card | null;
  isCorrect: boolean | null;
  lastWrongPhase: GamePhase | '';
  wrongAnswerCard: Card | null;
}

const CARD_VALUES: Record<string, number> = {
  'ACE': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'JACK': 11,
  'QUEEN': 12,
  'KING': 13,
};

export function useRideTheBus() {
  const [balance, setBalanceState] = useState(300); // default fallback
  const [gameState, setGameState] = useState<GameState>({
    phase: 'wager',
    wager: null,
    currentBet: 0,
    deckId: null,
    currentCard: null,
    firstCard: null,
    secondCard: null,
    thirdCard: null,
    previousCard: null,
    isCorrect: null,
    lastWrongPhase: '',
    wrongAnswerCard: null,
  });

  useEffect(() => {
    // Load balance from server on mount
    getBalanceFromServer().then(setBalanceState).catch(() => {
      // fallback to 300 if server call fails
      setBalanceState(300);
    });
  }, []);

  const fetchCard = useCallback(async (deckId: string, count: number = 1): Promise<Card[]> => {
    const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);
    const data = await response.json();
    return data.cards || [];
  }, []);

  const shuffleDeck = useCallback(async (): Promise<string> => {
    const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
    const data = await response.json();
    return data.deck_id;
  }, []);

  const initializeGame = useCallback(async () => {
    const deckId = await shuffleDeck();
    setGameState({
      phase: 'wager',
      wager: null,
      currentBet: 0,
      deckId,
      currentCard: null,
      firstCard: null,
      secondCard: null,
      thirdCard: null,
      previousCard: null,
      isCorrect: null,
      lastWrongPhase: '',
      wrongAnswerCard: null,
    });
  }, [shuffleDeck]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'wager',
      wager: null,
      currentBet: 0,
      currentCard: null,
      firstCard: null,
      secondCard: null,
      previousCard: null,
      isCorrect: null,
      wrongAnswerCard: null,
    }));
  }, []);

  const handleWager = useCallback(async (wagerAmount: number) => {
    if (wagerAmount < 10 || wagerAmount > balance) return;

    let deckId = gameState.deckId;
    if (!deckId) {
      deckId = await shuffleDeck();
    }

    // Don't fetch card yet - user guesses first in red/black phase
    setGameState(prev => ({
      ...prev,
      phase: 'redblack',
      wager: wagerAmount,
      currentBet: wagerAmount,
      deckId,
    }));
  }, [balance, gameState.deckId, shuffleDeck]);

  const handleGuess = useCallback(async (guess: string) => {
    if (!gameState.deckId) return;

    // For redblack phase, we need to fetch the card first
    let currentCards: Card[] = [];

    switch (gameState.phase) {
      case 'redblack': {
        // First round - fetch card, check guess, store card for next round
        currentCards = await fetchCard(gameState.deckId, 1);
        if (!currentCards || currentCards.length === 0) return;

        const card = currentCards[0];
        const isRed = ['HEARTS', 'DIAMONDS'].includes(card.suit);
        const isBlack = ['CLUBS', 'SPADES'].includes(card.suit);
        const isCorrect = (guess === 'red' && isRed) || (guess === 'black' && isBlack);

        if (isCorrect) {
          setGameState(prev => ({
            ...prev,
            phase: 'higherlower',
            currentBet: prev.currentBet * 2,
            firstCard: card,
            currentCard: card,
          }));
        } else {
          const newBalance = balance - (gameState.wager || 0);
          updateBalanceOnServer(- (gameState.wager || 0));
          setBalanceState(newBalance);
          setGameState(prev => ({
            ...prev,
            phase: 'result',
            isCorrect: false,
            lastWrongPhase: gameState.phase,
            wrongAnswerCard: card,
          }));
        }
        break;
      }

      case 'higherlower': {
        // User sees firstCard, guesses if second card is higher or lower
        currentCards = await fetchCard(gameState.deckId, 1);
        if (!currentCards || currentCards.length === 0) return;

        const card = currentCards[0];
        const currentValue = CARD_VALUES[card.value];
        const previousValue = CARD_VALUES[gameState.firstCard!.value];
        const isCorrect = (guess === 'higher' && currentValue > previousValue) ||
                         (guess === 'lower' && currentValue < previousValue);

        if (isCorrect) {
          setGameState(prev => ({
            ...prev,
            phase: 'inbetweenoutside',
            currentBet: prev.currentBet + (prev.wager || 0),
            secondCard: card,
            currentCard: card,
          }));
        } else {
          const newBalance = balance - (gameState.wager || 0);
          updateBalanceOnServer(- (gameState.wager || 0));
          setBalanceState(newBalance);
          setGameState(prev => ({
            ...prev,
            phase: 'result',
            isCorrect: false,
            lastWrongPhase: gameState.phase,
            wrongAnswerCard: card,
          }));
        }
        break;
      }

      case 'inbetweenoutside': {
        // User sees firstCard and secondCard, guesses if third card is between or outside
        currentCards = await fetchCard(gameState.deckId, 1);
        if (!currentCards || currentCards.length === 0) return;

        const card = currentCards[0];
        const currentValue = CARD_VALUES[card.value];
        const val1 = CARD_VALUES[gameState.firstCard!.value];
        const val2 = CARD_VALUES[gameState.secondCard!.value];
        const min = Math.min(val1, val2);
        const max = Math.max(val1, val2);
        const isInBetween = currentValue > min && currentValue < max;
        const isOutside = currentValue < min || currentValue > max;
        const isCorrect = (guess === 'inbetween' && isInBetween) || (guess === 'outside' && isOutside);

        if (isCorrect) {
          setGameState(prev => ({
            ...prev,
            phase: 'picksuit',
            currentBet: prev.currentBet + (prev.wager || 0),
            currentCard: card,
          }));
        } else {
          const newBalance = balance - (gameState.wager || 0);
          updateBalanceOnServer(- (gameState.wager || 0));
          setBalanceState(newBalance);
          setGameState(prev => ({
            ...prev,
            phase: 'result',
            isCorrect: false,
            lastWrongPhase: gameState.phase,
            wrongAnswerCard: card,
          }));
        }
        break;
      }

      case 'picksuit': {
        // For pick suit phase, draw the 4th card and guess its suit
        currentCards = await fetchCard(gameState.deckId, 1);
        if (!currentCards || currentCards.length === 0) return;

        const card = currentCards[0];
        const suitMap: Record<string, string> = {
          'h': 'HEARTS',
          'd': 'DIAMONDS',
          'c': 'CLUBS',
          's': 'SPADES',
        };
        const isCorrect = card.suit === suitMap[guess];

        if (isCorrect) {
          // Completed all rounds successfully - store the 4th card
          const newBalance = balance + gameState.currentBet;
          updateBalanceOnServer(gameState.currentBet);
          setBalanceState(newBalance);
          setGameState(prev => ({
            ...prev,
            phase: 'win',
            isCorrect: true,
            currentCard: card, // Store the 4th card
          }));
        } else {
          const newBalance = balance - (gameState.wager || 0);
          updateBalanceOnServer(- (gameState.wager || 0));
          setBalanceState(newBalance);
          setGameState(prev => ({
            ...prev,
            phase: 'result',
            isCorrect: false,
            lastWrongPhase: gameState.phase,
            wrongAnswerCard: card, // Store the 4th card that was wrong
          }));
        }
        break;
      }
    }
  }, [gameState, fetchCard, balance, setBalanceState]);

  const handleForfeit = useCallback(async () => {
    // Cash out current winnings (if any) and reset
    const winnings = Math.max(0, gameState.currentBet - (gameState.wager || 0));
    if (winnings > 0) {
      await updateBalanceOnServer(winnings);
      setBalanceState(prev => prev + winnings);
    }
    await initializeGame();
  }, [gameState, updateBalanceOnServer, setBalanceState, initializeGame]);

  return {
    balance,
    gameState,
    handleWager,
    handleGuess,
    initializeGame,
    resetGame,
    handleForfeit,
  };
}
