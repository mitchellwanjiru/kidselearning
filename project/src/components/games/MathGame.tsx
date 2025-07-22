import React, { useState } from "react";
import { Home } from "lucide-react";

interface MathGameProps {
  onBack: () => void;
}

export const MathGame: React.FC<MathGameProps> = ({ onBack }) => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [rocketPosition, setRocketPosition] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const mathProblems = [
    { question: "2 + 1 = ?", answer: 3, options: [2, 3, 4, 5] },
    { question: "4 - 2 = ?", answer: 2, options: [1, 2, 3, 4] },
    { question: "3 + 2 = ?", answer: 5, options: [4, 5, 6, 7] },
    { question: "6 - 3 = ?", answer: 3, options: [2, 3, 4, 5] },
    { question: "1 + 4 = ?", answer: 5, options: [4, 5, 6, 7] },
    { question: "5 - 1 = ?", answer: 4, options: [3, 4, 5, 6] },
  ];

  const handleMathAnswer = (answer: number) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === mathProblems[currentProblem].answer;
    setShowResult(true);

    if (isCorrect) {
      setGameScore((prev) => prev + 25);
      setRocketPosition((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentProblem < mathProblems.length - 1) {
        setCurrentProblem((prev) => prev + 1);
        setShowResult(false);
        setSelectedAnswer(null);
      } else {
        setGameComplete(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setGameComplete(false);
    setCurrentProblem(0);
    setGameScore(0);
    setRocketPosition(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const problem = mathProblems[currentProblem];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-4">
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
            <h1 className="text-3xl font-bold text-white">🚀 Space Math</h1>
            <p className="text-blue-200">
              Mission {currentProblem + 1} • Score: {gameScore} points
            </p>
            <p className="text-sm text-gray-400">
              (Game points are for fun - learning points unlock new games!)
            </p>
          </div>
          <div className="w-12"></div>
        </div>

        {gameComplete ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🌟</div>
            <h2 className="text-3xl font-bold text-blue-600 mb-4">
              Mission Accomplished!
            </h2>
            <p className="text-xl text-gray-700 mb-4">
              Your rocket reached the stars!
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
                className="bg-gradient-to-r from-blue-400 to-purple-500 text-white py-3 px-6 rounded-2xl text-lg font-bold hover:from-blue-500 hover:to-purple-600 transform hover:scale-105 transition-all duration-300"
              >
                New Mission! 🚀
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
            {/* Rocket Progress */}
            <div className="mb-8">
              <div className="relative h-20 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 rounded-xl"
                  style={{
                    width: `${(rocketPosition / mathProblems.length) * 100}%`,
                  }}
                ></div>
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-2xl">
                  🌍
                </div>
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 text-3xl transition-all duration-1000"
                  style={{
                    left: `${Math.min(
                      (rocketPosition / mathProblems.length) * 85,
                      85
                    )}%`,
                  }}
                >
                  🚀
                </div>
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-2xl">
                  ⭐
                </div>
              </div>
              <div className="text-center mt-2">
                <span className="text-sm text-gray-600">
                  Help the rocket reach the stars!
                </span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {problem.question}
              </h2>
              <p className="text-gray-600">
                Choose the correct answer to power the rocket!
              </p>
            </div>

            {!showResult ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {problem.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleMathAnswer(option)}
                    className="bg-gradient-to-br from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white py-3 px-6 rounded-2xl text-lg font-bold transition-all duration-300 shadow-md"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedAnswer === problem.answer ? "Correct!" : "Oops!"}
                </h3>
                <p className="text-gray-600 mb-4">
                  The correct answer is{" "}
                  <span className="font-bold">{problem.answer}</span>.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
