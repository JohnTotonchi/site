'use client';

import { useState, useEffect } from 'react';
import { Particles } from '@/components/magicui/particles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRideTheBus } from '@/hooks/use-ride-the-bus';
import { AdminPanel } from '@/components/admin-panel';
import { getUsername, setUsername } from '@/lib/balance-server';

export default function RideTheBusPage() {
  const { balance, gameState, handleWager, handleGuess, initializeGame, resetGame, handleForfeit } = useRideTheBus();
  const [wagerInput, setWagerInput] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [username, setUsernameState] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUsername = getUsername();
    setUsernameState(savedUsername);
    setIsEditingName(!savedUsername); // Show name input if no name is saved
  }, []);

  const handleSaveName = async () => {
    await setUsername(username.trim());
    setIsEditingName(false);
  };

  // Helper functions for showing wrong answer cards
  const getCardToShow = () => {
    // Use the stored wrong answer card directly
    return gameState.wrongAnswerCard;
  };

  const getCardValueDescription = () => {
    const card = getCardToShow();
    if (!card) return "";

    const color = ['HEARTS', 'DIAMONDS'].includes(card.suit) ? 'Red' : 'Black';
    return `${color} - ${card.value} of ${card.suit}`;
  };

  const phaseTitles: Record<string, string> = {
    wager: 'Place Your Wager',
    redblack: 'Red or Black?',
    higherlower: 'Higher or Lower?',
    inbetweenoutside: 'In-Between or Outside?',
    picksuit: 'Pick a Suit',
    result: 'Game Result',
    win: 'Congratulations!',
  };

  const currentTitle = phaseTitles[gameState.phase];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <Particles
        className="absolute inset-0"
        quantity={50}
        ease={80}
        color="#64ffda"
        refresh={false}
      />

      <div className="absolute top-4 left-4 text-white text-lg font-semibold">
        Balance: {mounted ? `$${balance}` : '...'}
      </div>

      {/* Admin Button */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdmin(true)}
          className="text-white hover:bg-white/10"
        >
          Admin
        </Button>
      </div>

      <div className="w-full max-w-md p-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">{currentTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Balance Display */}
            <div className="text-center text-2xl font-bold text-green-600">
              ${balance}
            </div>

            {/* Name Input/Editing */}
            {isEditingName && (
              <div className="space-y-4">
                <div className="text-center text-sm text-muted-foreground">
                  Set your display name:
                </div>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsernameState(e.target.value)}
                  className="text-center"
                  maxLength={20}
                />
                <Button
                  onClick={handleSaveName}
                  className="w-full"
                  disabled={!username.trim()}
                >
                  Save Name
                </Button>
              </div>
            )}

            {!isEditingName && username && (
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">
                  Welcome, <span className="font-semibold">{username}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingName(true)}
                >
                  Edit Name
                </Button>
              </div>
            )}

            {/* Wager Phase */}
            {gameState.phase === 'wager' && (
              <div className="space-y-4">
                <div className="text-center text-sm text-muted-foreground">
                  Minimum wager: $10
                </div>
                <Input
                  type="number"
                  placeholder="Enter wager amount"
                  value={wagerInput}
                  onChange={(e) => setWagerInput(e.target.value)}
                  min="10"
                  className="text-center"
                />
                <Button
                  onClick={() => handleWager(parseInt(wagerInput) || 0)}
                  className="w-full"
                  disabled={
                    !wagerInput ||
                    parseInt(wagerInput) < 10 ||
                    parseInt(wagerInput) > balance ||
                    (gameState.phase !== 'wager' && gameState.phase !== 'result' && gameState.phase !== 'win')
                  }
                >
                  Start Game
                </Button>
              </div>
            )}

            {/* Game Phases */}
            {gameState.phase !== 'wager' && gameState.phase !== 'result' && gameState.phase !== 'win' && (
              <div className="space-y-4">
                {/* Card Display - show appropriate revealed cards based on phase */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {/* Always show first revealed card (from higher/lower phase onward) */}
                  {gameState.phase !== 'redblack' && gameState.firstCard && (
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        Card 1: {gameState.firstCard.value}
                      </div>
                      <div className="w-32 h-40 flex items-center justify-center">
                        <img
                          src={gameState.firstCard.image}
                          alt={`${gameState.firstCard.value} of ${gameState.firstCard.suit}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Show second card (from in-between/outside phase onward) */}
                  {(gameState.phase === 'inbetweenoutside' || gameState.phase === 'picksuit') && gameState.secondCard && (
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        Card 2: {gameState.secondCard.value}
                      </div>
                      <div className="w-32 h-40 flex items-center justify-center">
                        <img
                          src={gameState.secondCard.image}
                          alt={`${gameState.secondCard.value} of ${gameState.secondCard.suit}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Show third card (from pick suit phase onward) */}
                  {gameState.phase === 'picksuit' && gameState.thirdCard && (
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        Card 3: {gameState.thirdCard.value}
                      </div>
                      <div className="w-32 h-40 flex items-center justify-center">
                        <img
                          src={gameState.thirdCard.image}
                          alt={`${gameState.thirdCard.value} of ${gameState.thirdCard.suit}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {gameState.phase === 'redblack' && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleGuess('red')} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                      Red
                    </Button>
                    <Button onClick={() => handleGuess('black')} className="flex-1 bg-black hover:bg-black/80 text-white">
                      Black
                    </Button>
                  </div>
                )}

                {gameState.phase === 'higherlower' && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleGuess('higher')} className="flex-1">
                      Higher
                    </Button>
                    <Button onClick={() => handleGuess('lower')} className="flex-1">
                        Lower
                      </Button>
                  </div>
                )}

                {gameState.phase === 'inbetweenoutside' && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleGuess('inbetween')} className="flex-1">
                      In Between
                    </Button>
                    <Button onClick={() => handleGuess('outside')} className="flex-1">
                      Outside
                    </Button>
                  </div>
                )}

                {gameState.phase === 'picksuit' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={() => handleGuess('h')} className="bg-red-600 hover:bg-red-700 text-white">
                        Hearts
                      </Button>
                      <Button onClick={() => handleGuess('d')} className="bg-red-600 hover:bg-red-700 text-white">
                        Diamonds
                      </Button>
                      <Button onClick={() => handleGuess('c')} className="bg-black hover:bg-black/80 text-white border-2 border-white">
                        Clubs
                      </Button>
                      <Button onClick={() => handleGuess('s')} className="bg-black hover:bg-black/80 text-white border-2 border-white">
                        Spades
                      </Button>
                    </div>
                  </div>
                )}

                {/* Forfeit Button - appears during all active game phases */}
                {(gameState.phase as string) !== 'wager' && (gameState.phase as string) !== 'result' && (gameState.phase as string) !== 'win' && (
                  <Button
                    onClick={handleForfeit}
                    variant="outline"
                    className="w-full border-red-500 text-red-500 hover:bg-red-50"
                  >
                    Forfeit & Cash Out (+${Math.max(0, gameState.currentBet - Number(gameState.wager || 0))})
                  </Button>
                )}

                <div className="text-center text-sm text-muted-foreground">
                  Current bet: ${gameState.currentBet}
                </div>
              </div>
            )}

            {/* Result Phase */}
            {gameState.phase === 'result' && (
              <div className="space-y-4 text-center">
                <div className="text-lg">
                  {gameState.isCorrect ? 'Correct!' : 'Wrong!'}
                </div>

                {/* Show the card that proved them wrong */}
                {!gameState.isCorrect && (
                  <div className="my-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      The card was:
                    </div>
                    <div className="inline-block">
                      <div className="text-xs text-muted-foreground mb-1 text-center">
                        {getCardValueDescription()}
                      </div>
                      <div className="w-32 h-40 flex items-center justify-center">
                        {getCardToShow() && (
                          <img
                            src={getCardToShow()!.image}
                            alt={`${getCardToShow()!.value} of ${getCardToShow()!.suit}`}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  {gameState.isCorrect
                    ? `You won $${gameState.currentBet}!`
                    : `You lost $${gameState.wager || 0}.`
                  }
                </div>

                <Button onClick={initializeGame} className="w-full">
                  Play Again
                </Button>
              </div>
            )}

            {/* Win Phase */}
            {gameState.phase === 'win' && (
              <div className="space-y-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  🎉 You completed all rounds! 🎉
                </div>
                <div className="text-lg">
                  Final winnings: ${gameState.currentBet}
                </div>

                {/* Show all three cards from the winning game */}
                <div className="my-6">
                  <div className="text-sm text-muted-foreground mb-4">
                    Your winning hand:
                  </div>
                  <div className="flex justify-center gap-2">
                    {gameState.firstCard && (
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          Card 1: {gameState.firstCard.value}
                        </div>
                        <div className="w-32 h-40 flex items-center justify-center">
                          <img
                            src={gameState.firstCard.image}
                            alt={`${gameState.firstCard.value} of ${gameState.firstCard.suit}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                    {gameState.secondCard && (
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          Card 2: {gameState.secondCard.value}
                        </div>
                        <div className="w-32 h-40 flex items-center justify-center">
                          <img
                            src={gameState.secondCard.image}
                            alt={`${gameState.secondCard.value} of ${gameState.secondCard.suit}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                    {gameState.thirdCard && (
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          Card 3: {gameState.thirdCard.value}
                        </div>
                        <div className="w-32 h-40 flex items-center justify-center">
                          <img
                            src={gameState.thirdCard.image}
                            alt={`${gameState.thirdCard.value} of ${gameState.thirdCard.suit}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                    {gameState.currentCard && (
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          Card 4: {gameState.currentCard.value}
                        </div>
                        <div className="w-32 h-40 flex items-center justify-center">
                          <img
                            src={gameState.currentCard.image}
                            alt={`${gameState.currentCard.value} of ${gameState.currentCard.suit}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button onClick={resetGame} className="w-full">
                  Play Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AdminPanel open={showAdmin} onOpenChange={setShowAdmin} />
    </div>
  );
}
