/**
 * Landing Page Demo
 *
 * This is a standalone demo of the LandingPage component.
 * You can run this to see how the landing page looks and works.
 */

import { LandingPage } from "./components/LandingPage";

export function LandingPageDemo() {
  const handleLogin = () => {
    alert(
      "Login button clicked! \n\nIn your app, this would:\n- Open your AuthWrapper component\n- Show login form\n- Redirect to main app after auth"
    );
  };

  const handleSignup = () => {
    alert(
      "Signup button clicked! \n\nIn your app, this would:\n- Open your AuthWrapper component\n- Show signup form\n- Redirect to main app after auth"
    );
  };

  return <LandingPage onLogin={handleLogin} onSignup={handleSignup} />;
}

export default LandingPageDemo;
