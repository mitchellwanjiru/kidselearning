import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthWrapper } from "./components/AuthWrapper";

export default function AppRouter() {
  const [currentPage, setCurrentPage] = useState<"landing" | "app">("landing");
  const [showAuth, setShowAuth] = useState(false);

  const handleLogin = () => {
    setShowAuth(true);
  };

  const handleSignup = () => {
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setCurrentPage("app");
  };

  const handleBackToLanding = () => {
    setCurrentPage("landing");
    setShowAuth(false);
  };

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={handleBackToLanding}
              className="mb-4 text-purple-600 hover:text-purple-800 font-medium"
            >
              ← Back to Landing Page
            </button>
            <AuthWrapper>
              {(user) => {
                // Once authenticated, go to main app
                if (user) {
                  handleAuthSuccess();
                  return null;
                }
                return null;
              }}
            </AuthWrapper>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === "landing") {
    return <LandingPage onLogin={handleLogin} onSignup={handleSignup} />;
  }

  // This would be your existing App.tsx content
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-purple-800">
              AI Learning Buddy
            </h1>
            <button
              onClick={handleBackToLanding}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Back to Landing
            </button>
          </div>
          {/* Your existing App.tsx content would go here */}
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">
              Welcome to the Learning Dashboard!
            </h2>
            <p className="text-purple-600">
              Your existing app functionality goes here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
