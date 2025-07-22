import React, { useState, useEffect } from "react";
import { Home } from "lucide-react";

interface MemoryGameProps {
  onBack: () => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ onBack }) => {
  const [gameCards, setGameCards] = useState<
    { id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]
  >([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Initialize game on component mount
  useEffect(() => {
    const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setGameCards(shuffledCards);
  }, []);

  const handleCardClick = (cardId: number) => {
    if (
      flippedCards.length === 2 ||
      gameCards[cardId].isMatched ||
      gameCards[cardId].isFlipped
    ) {
      return;
    }

    const newCards = [...gameCards];
    newCards[cardId].isFlipped = true;
    setGameCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [first, second] = newFlippedCards;
      if (gameCards[first].emoji === gameCards[second].emoji) {
        // Match found
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[first].isMatched = true;
          updatedCards[second].isMatched = true;
          setGameCards(updatedCards);
          setGameScore((prev) => prev + 10);
          setFlippedCards([]);

          // Check if game is complete
          if (updatedCards.every((card) => card.isMatched)) {
            setGameComplete(true);
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[first].isFlipped = false;
          updatedCards[second].isFlipped = false;
          setGameCards(updatedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setGameComplete(false);
    setGameScore(0);
    setFlippedCards([]);
    const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setGameCards(shuffledCards);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <Home className="text-purple-600 text-xl" />
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-orange-800">
              🧠 Memory Game
            </h1>
            <p className="text-orange-600">Score: {gameScore} points</p>
            <p className="text-sm text-gray-500">
              (Game points are for fun - learning points unlock new games!)
            </p>
          </div>
          <div className="w-12"></div>
        </div>

        {gameComplete ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              Congratulations!
            </h2>
            <p className="text-xl text-gray-700 mb-4">
              You completed the memory game!
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Final Game Score: {gameScore} points
            </p>
            <p className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3 mb-6">
              💡 Remember: Complete learning modules to earn points that unlock
              new games!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-purple-400 to-pink-500 text-white py-3 px-6 rounded-2xl text-lg font-bold hover:from-purple-500 hover:to-pink-600 transform hover:scale-105 transition-all duration-300"
              >
                Play Again! 🔄
              </button>
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 px-6 rounded-2xl text-lg font-bold hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300"
              >
                More Games! 🎮
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Find the Matching Pairs!
              </h2>
              <p className="text-gray-600">
                Click on cards to flip them and find matches
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
              {gameCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`aspect-square rounded-xl text-3xl font-bold transition-all duration-300 ${
                    card.isFlipped || card.isMatched
                      ? "bg-white border-2 border-orange-300 shadow-lg"
                      : "bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 shadow-md hover:shadow-lg transform hover:scale-105"
                  }`}
                  disabled={card.isMatched}
                >
                  {card.isFlipped || card.isMatched ? card.emoji : "?"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
