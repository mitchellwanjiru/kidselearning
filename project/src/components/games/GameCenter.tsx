import React from "react";
import { Home, Star } from "lucide-react";

interface GameCenterProps {
  progress: { totalPoints: number };
  onBack: () => void;
  onSelectGame: (gameId: string) => void;
}

export const GameCenter: React.FC<GameCenterProps> = ({
  progress,
  onBack,
  onSelectGame,
}) => {
  const games = [
    {
      id: "memory",
      title: "🧠 Memory Game",
      description: "Find matching pairs of cute animals!",
      unlockPoints: 50,
      color: "from-yellow-400 to-orange-500",
      icon: "🎮",
    },
    {
      id: "colors",
      title: "🎨 Color Quest",
      description: "Mix colors and paint the rainbow!",
      unlockPoints: 100,
      color: "from-pink-400 to-purple-500",
      icon: "🌈",
    },
    {
      id: "math",
      title: "🚀 Space Math",
      description: "Help the rocket reach the stars with math!",
      unlockPoints: 150,
      color: "from-blue-400 to-indigo-500",
      icon: "🚀",
    },
  ];

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
            <h1 className="text-4xl font-bold text-orange-800">
              🎮 Game Center
            </h1>
            <p className="text-orange-600">Choose your adventure!</p>
          </div>
          <div className="w-12"></div>
        </div>

        {/* Learning Points Info */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-center">
          <h3 className="text-lg font-bold text-blue-800 mb-2">
            📚 Learning Points Unlock Games!
          </h3>
          <p className="text-blue-700">
            Complete learning modules to earn points that unlock new games. Game
            scores are just for fun! 🎯
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => {
            const isUnlocked = progress.totalPoints >= game.unlockPoints;

            return (
              <div
                key={game.id}
                className={`relative bg-white rounded-3xl shadow-xl p-6 transform transition-all duration-300 ${
                  isUnlocked ? "hover:scale-105 cursor-pointer" : "opacity-60"
                }`}
                onClick={() => isUnlocked && onSelectGame(game.id)}
              >
                {/* Lock indicator for locked games */}
                {!isUnlocked && (
                  <div className="absolute top-4 right-4 bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                    🔒
                  </div>
                )}

                <div
                  className={`bg-gradient-to-br ${game.color} p-6 rounded-2xl mb-4`}
                >
                  <div className="text-center text-6xl">{game.icon}</div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  {game.title}
                </h3>

                <p className="text-gray-600 text-center mb-4">
                  {game.description}
                </p>

                <div className="text-center">
                  {isUnlocked ? (
                    <button className="bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 px-4 rounded-xl font-bold hover:from-green-500 hover:to-blue-600 transition-all">
                      Play Now! ✨
                    </button>
                  ) : (
                    <div className="text-gray-500">
                      <p className="text-sm font-medium">
                        Unlock with {game.unlockPoints} learning points
                      </p>
                      <p className="text-xs">
                        ({game.unlockPoints - progress.totalPoints} more needed)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className="mt-8 bg-white rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Your Learning Progress
          </h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="text-yellow-500 text-xl" />
            <span className="text-2xl font-bold text-purple-600">
              {progress.totalPoints} learning points
            </span>
          </div>
          <p className="text-gray-600 mb-4">
            Complete learning modules to unlock more games!
          </p>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              💡 Learning points come from answering questions correctly in
              modules like Letters, Numbers, Colors, etc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
