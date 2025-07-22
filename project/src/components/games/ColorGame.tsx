import React, { useState } from "react";
import { Home, Check, X } from "lucide-react";

interface ColorGameProps {
  onBack: () => void;
}

export const ColorGame: React.FC<ColorGameProps> = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const colorChallenges = [
    {
      question: "Mix red and blue to make...",
      colors: ["red", "blue"],
      result: "purple",
      options: ["purple", "green", "orange", "yellow"],
    },
    {
      question: "Mix yellow and red to make...",
      colors: ["yellow", "red"],
      result: "orange",
      options: ["green", "orange", "purple", "blue"],
    },
    {
      question: "Mix blue and yellow to make...",
      colors: ["blue", "yellow"],
      result: "green",
      options: ["orange", "purple", "green", "pink"],
    },
    {
      question: "What color is the sun?",
      colors: [],
      result: "yellow",
      options: ["yellow", "orange", "red", "blue"],
    },
    {
      question: "What color is grass?",
      colors: [],
      result: "green",
      options: ["blue", "green", "red", "yellow"],
    },
  ];

  type ColorKey =
    | "red"
    | "blue"
    | "yellow"
    | "green"
    | "purple"
    | "orange"
    | "pink";

  const colorStyles: Record<ColorKey, string> = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    pink: "bg-pink-500",
  };

  const handleColorAnswer = (answer: string) => {
    const correct = answer === colorChallenges[currentLevel].result;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setGameScore((prev) => prev + 20);
    }

    setTimeout(() => {
      if (currentLevel < colorChallenges.length - 1) {
        setCurrentLevel((prev) => prev + 1);
        setShowResult(false);
        setSelectedAnswer(null);
      } else {
        setGameComplete(true);
      }
    }, 3000);
  };

  const resetGame = () => {
    setGameComplete(false);
    setCurrentLevel(0);
    setGameScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const challenge = colorChallenges[currentLevel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4">
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
            <h1 className="text-3xl font-bold text-purple-800">
              🎨 Color Quest
            </h1>
            <p className="text-purple-600">
              Level {currentLevel + 1} • Game Score: {gameScore} points
            </p>
            <p className="text-sm text-gray-500">
              (Game points are for fun - learning points unlock new games!)
            </p>
          </div>
          <div className="w-12"></div>
        </div>

        {gameComplete ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🌈</div>
            <h2 className="text-3xl font-bold text-purple-600 mb-4">
              Amazing Artist!
            </h2>
            <p className="text-xl text-gray-700 mb-4">
              You completed the Color Quest game!
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
                Paint Again! 🎨
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
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {challenge.question}
              </h2>

              {/* Color mixing visual */}
              {challenge.colors.length > 0 && (
                <div className="flex items-center justify-center gap-4 mb-6">
                  {challenge.colors.map((color, index) => (
                    <React.Fragment key={color}>
                      <div
                        className={`w-16 h-16 rounded-full ${
                          colorStyles[color as ColorKey]
                        } border-4 border-white shadow-lg`}
                      ></div>
                      {index < challenge.colors.length - 1 && (
                        <span className="text-3xl">+</span>
                      )}
                    </React.Fragment>
                  ))}
                  {challenge.colors.length > 0 && (
                    <span className="text-3xl">=</span>
                  )}
                  <span className="text-3xl">?</span>
                </div>
              )}
            </div>

            {!showResult ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {challenge.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleColorAnswer(option)}
                    className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 border-4 border-white shadow-lg ${
                      colorStyles[option as ColorKey]
                    }`}
                  >
                    <div className="text-white font-bold text-lg capitalize">
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center">
                {/* Result Display */}
                <div
                  className={`p-6 rounded-2xl mb-6 ${
                    isCorrect
                      ? "bg-green-100 border-2 border-green-300"
                      : "bg-red-100 border-2 border-red-300"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCorrect ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {isCorrect ? (
                        <Check className="text-white text-2xl" />
                      ) : (
                        <X className="text-white text-2xl" />
                      )}
                    </div>
                    <h3
                      className={`text-2xl font-bold ${
                        isCorrect ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {isCorrect ? "Correct!" : "Oops!"}
                    </h3>
                  </div>

                  {!isCorrect && (
                    <div className="mb-4">
                      <p className="text-red-700 font-medium mb-3">
                        You chose:{" "}
                        <span className="capitalize font-bold">
                          {selectedAnswer}
                        </span>
                      </p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 font-medium mb-2">
                          💡 The correct answer is:
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-full ${
                              colorStyles[challenge.result as ColorKey]
                            } border-2 border-white shadow-lg`}
                          ></div>
                          <span className="text-green-800 font-bold text-xl capitalize">
                            {challenge.result}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {isCorrect && (
                    <div className="mb-4">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div
                          className={`w-12 h-12 rounded-full ${
                            colorStyles[challenge.result as ColorKey]
                          } border-2 border-white shadow-lg`}
                        ></div>
                        <span className="text-green-700 font-bold text-xl capitalize">
                          {challenge.result}!
                        </span>
                      </div>
                      <p className="text-green-700 font-medium">
                        Great job! You're getting better at colors! 🎨
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress to next level */}
                <div className="text-gray-600 mb-4">
                  {currentLevel < colorChallenges.length - 1 ? (
                    <p>Get ready for the next color challenge!</p>
                  ) : (
                    <p>Final level complete! 🎉</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
