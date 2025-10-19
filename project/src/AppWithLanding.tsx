/**
 * Example Integration of Landing Page
 *
 * This file shows how to integrate the LandingPage component with your existing app.
 * You can use this as a reference to modify your App.tsx or create routing.
 */

import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import App from "./App"; // Your existing App component

export function AppWithLanding() {
  const [showLandingPage, setShowLandingPage] = useState(true);

  const handleLogin = () => {
    // You can customize this to show a login modal or redirect to auth
    console.log("Login clicked - you can integrate with your AuthWrapper here");
    setShowLandingPage(false); // For demo, just go to main app
  };

  const handleSignup = () => {
    // You can customize this to show a signup modal or redirect to auth
    console.log(
      "Signup clicked - you can integrate with your AuthWrapper here"
    );
    setShowLandingPage(false); // For demo, just go to main app
  };

  if (showLandingPage) {
    return <LandingPage onLogin={handleLogin} onSignup={handleSignup} />;
  }

  // Return your existing app
  return (
    <div>
      {/* Optional: Add a button to go back to landing page */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowLandingPage(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          ← Back to Landing
        </button>
      </div>
      <App />
    </div>
  );
}

export default AppWithLanding;
