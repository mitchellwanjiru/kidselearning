import { useState } from "react";
import {
  Brain,
  Sparkles,
  Heart,
  Star,
  BookOpen,
  Calculator,
  Palette,
  PawPrint,
  Users,
  Trophy,
  ArrowRight,
  Play,
  CheckCircle,
  Quote,
  Menu,
  X,
  Shield,
  Globe,
  TrendingUp,
} from "lucide-react";

interface LandingPageProps {
  onLogin?: () => void;
  onSignup?: () => void;
}

export function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      // Default behavior - you can modify this
      console.log("Login clicked");
    }
  };

  const handleSignup = () => {
    if (onSignup) {
      onSignup();
    } else {
      // Default behavior - you can modify this
      console.log("Signup clicked");
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description:
        "Questions adapt to your child's age, learning style, and progress in real-time",
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: Heart,
      title: "Personalized Experience",
      description:
        "Each child gets a unique learning journey tailored just for them",
      color: "from-pink-400 to-pink-600",
    },
    {
      icon: Trophy,
      title: "Progress Tracking",
      description:
        "Watch your child grow with detailed analytics and achievement milestones",
      color: "from-yellow-400 to-yellow-600",
    },
    {
      icon: Sparkles,
      title: "Engaging Content",
      description:
        "Fun, interactive lessons that keep kids excited about learning",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description:
        "Child-safe environment with no ads, tracking, or inappropriate content",
      color: "from-green-400 to-green-600",
    },
    {
      icon: Globe,
      title: "Works Everywhere",
      description:
        "Access learning adventures from any device, anywhere, anytime",
      color: "from-indigo-400 to-indigo-600",
    },
  ];

  const subjects = [
    {
      icon: BookOpen,
      title: "Letters & Phonics",
      description: "Master the alphabet and start reading with confidence",
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
      ageRange: "Ages 5-8",
    },
    {
      icon: Calculator,
      title: "Numbers & Math",
      description: "Discover the magic of numbers and basic mathematics",
      color: "bg-gradient-to-br from-green-400 to-green-600",
      ageRange: "Ages 5-11",
    },
    {
      icon: Palette,
      title: "Colors & Shapes",
      description: "Explore the world of colors and geometric patterns",
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
      ageRange: "Ages 5-7",
    },
    {
      icon: PawPrint,
      title: "Animals & Nature",
      description: "Meet amazing animals and learn about our natural world",
      color: "bg-gradient-to-br from-orange-400 to-orange-600",
      ageRange: "Ages 5-9",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Mom of 2",
      image: "👩‍💼",
      quote:
        "My 6-year-old Emma went from struggling with letters to reading simple books in just 3 months! The AI really understands how she learns best.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Elementary Teacher",
      image: "👨‍🏫",
      quote:
        "I recommend this to all my students' parents. The personalized approach is exactly what each child needs to succeed.",
      rating: 5,
    },
    {
      name: "Lisa Thompson",
      role: "Homeschool Parent",
      image: "👩‍🎓",
      quote:
        "Finally, an educational app that adapts to my child's pace. No more frustration, just pure joy in learning!",
      rating: 5,
    },
  ];

  const stats = [
    { number: "50K+", label: "Happy Families" },
    { number: "1M+", label: "Questions Answered" },
    { number: "98%", label: "Love Learning More" },
    { number: "4.9★", label: "Parent Rating" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Brain className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold text-purple-800">
                AI Learning Buddy
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-purple-700 hover:text-purple-900 font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#subjects"
                className="text-purple-700 hover:text-purple-900 font-medium transition-colors"
              >
                Subjects
              </a>
              <a
                href="#testimonials"
                className="text-purple-700 hover:text-purple-900 font-medium transition-colors"
              >
                Reviews
              </a>
              <a
                href="#pricing"
                className="text-purple-700 hover:text-purple-900 font-medium transition-colors"
              >
                Pricing
              </a>

              <button
                onClick={handleLogin}
                className="text-purple-700 hover:text-purple-900 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleSignup}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full font-medium hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Get Started Free
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-purple-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-purple-100 py-4">
              <div className="flex flex-col gap-4">
                <a
                  href="#features"
                  className="text-purple-700 hover:text-purple-900 font-medium"
                >
                  Features
                </a>
                <a
                  href="#subjects"
                  className="text-purple-700 hover:text-purple-900 font-medium"
                >
                  Subjects
                </a>
                <a
                  href="#testimonials"
                  className="text-purple-700 hover:text-purple-900 font-medium"
                >
                  Reviews
                </a>
                <a
                  href="#pricing"
                  className="text-purple-700 hover:text-purple-900 font-medium"
                >
                  Pricing
                </a>
                <hr className="border-purple-100" />
                <button
                  onClick={handleLogin}
                  className="text-purple-700 hover:text-purple-900 font-medium text-left"
                >
                  Sign In
                </button>
                <button
                  onClick={handleSignup}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full font-medium hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="text-yellow-400 w-5 h-5 fill-current"
                    />
                  ))}
                </div>
                <span className="text-purple-700 font-medium">
                  Trusted by 50,000+ families
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-purple-900 mb-6 leading-tight">
                Where AI Meets
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {" "}
                  Joyful Learning
                </span>
              </h1>

              <p className="text-xl text-purple-700 mb-8 leading-relaxed">
                Give your child a personalized learning companion that adapts,
                encourages, and grows with them. Perfect for ages 5-11, trusted
                by teachers and loved by kids.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <button
                  onClick={handleSignup}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setVideoPlaying(true)}
                  className="bg-white text-purple-700 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 border-2 border-purple-200"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 text-sm text-purple-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              {/* Main App Preview */}
              <div className="relative transform rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-purple-200">
                  {/* Mock App Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Brain className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-purple-800">
                      Learning Dashboard
                    </span>
                  </div>

                  {/* Mock Subject Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {subjects.slice(0, 4).map((subject, index) => {
                      const IconComponent = subject.icon;
                      return (
                        <div
                          key={index}
                          className={`${subject.color} p-4 rounded-2xl text-white text-center transform hover:scale-105 transition-all cursor-pointer`}
                        >
                          <IconComponent className="w-8 h-8 mx-auto mb-2" />
                          <div className="text-sm font-bold">
                            {subject.title.split(" ")[0]}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mock AI Message */}
                  <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-2xl p-4 border-3 border-yellow-400">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🤖</span>
                      <span className="font-bold text-yellow-800 text-sm">
                        AI Buddy says:
                      </span>
                    </div>
                    <p className="text-yellow-800 text-sm">
                      "Great job today! You're getting really good at counting.
                      Ready for your next adventure?"
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center animate-bounce">
                <Trophy className="text-white w-8 h-8" />
              </div>

              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                <Star className="text-white w-6 h-6" />
              </div>

              <div
                className="absolute top-1/2 -left-8 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center animate-bounce"
                style={{ animationDelay: "1s" }}
              >
                <Heart className="text-white w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-200 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-purple-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-purple-900 mb-6">
              Why Parents & Teachers
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}
                Love Us
              </span>
            </h2>
            <p className="text-xl text-purple-700 max-w-3xl mx-auto leading-relaxed">
              Our AI-powered platform doesn't just teach – it understands,
              adapts, and grows with your child's unique learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-purple-100 hover:border-purple-200">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="text-white w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold text-purple-900 mb-4">
                      {feature.title}
                    </h3>

                    <p className="text-purple-700 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section
        id="subjects"
        className="py-20 bg-gradient-to-br from-purple-50 to-blue-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-purple-900 mb-6">
              Learning Adventures
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}
                Await
              </span>
            </h2>
            <p className="text-xl text-purple-700 max-w-3xl mx-auto leading-relaxed">
              From letters to numbers, colors to creatures – explore a world of
              knowledge designed just for your child.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {subjects.map((subject, index) => {
              const IconComponent = subject.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div
                      className={`${subject.color} p-8 text-white relative overflow-hidden`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <IconComponent className="w-12 h-12" />
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                          {subject.ageRange}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {subject.title}
                      </h3>
                      <p className="text-white/90">{subject.description}</p>

                      {/* Decorative Elements */}
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
                      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>
                    </div>

                    <div className="p-6">
                      <button
                        onClick={handleSignup}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-xl font-bold hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300"
                      >
                        Explore Subject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleSignup}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              Start Learning Today
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-purple-900 mb-6">
              How It
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}
                Works
              </span>
            </h2>
            <p className="text-xl text-purple-700 max-w-3xl mx-auto leading-relaxed">
              Getting started is as easy as 1-2-3. Watch your child's confidence
              and love for learning grow every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Child's Profile",
                description:
                  "Tell us about your child's age, interests, and learning goals. Our AI will create the perfect starting point.",
                icon: Users,
                color: "from-blue-400 to-blue-600",
              },
              {
                step: "2",
                title: "AI Personalizes Everything",
                description:
                  "Our smart AI analyzes how your child learns best and creates questions perfectly suited to their level.",
                icon: Brain,
                color: "from-purple-400 to-purple-600",
              },
              {
                step: "3",
                title: "Watch Them Flourish",
                description:
                  "Your child gets instant encouragement, parents get detailed progress reports, and everyone celebrates success!",
                icon: TrendingUp,
                color: "from-green-400 to-green-600",
              },
            ].map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="relative mb-8">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <IconComponent className="text-white w-8 h-8" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {step.step}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-purple-900 mb-4">
                    {step.title}
                  </h3>

                  <p className="text-purple-700 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-purple-900 mb-6">
              Real Stories from
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}
                Happy Families
              </span>
            </h2>
            <p className="text-xl text-purple-700 max-w-3xl mx-auto leading-relaxed">
              Don't just take our word for it – hear from parents and educators
              who've seen the magic happen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-yellow-100 hover:border-yellow-200">
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="text-yellow-400 w-5 h-5 fill-current"
                      />
                    ))}
                  </div>

                  <Quote className="text-purple-200 w-8 h-8 mb-4" />

                  <p className="text-purple-800 mb-6 leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-2xl">
                      {testimonial.image}
                    </div>
                    <div>
                      <div className="font-bold text-purple-900">
                        {testimonial.name}
                      </div>
                      <div className="text-purple-600 text-sm">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-purple-900 mb-6">
              Simple, Affordable
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}
                Pricing
              </span>
            </h2>
            <p className="text-xl text-purple-700 max-w-3xl mx-auto leading-relaxed">
              Give your child the gift of personalized learning. Start with our
              free trial – no credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Trial */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-purple-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-purple-900 mb-2">
                  Free Trial
                </h3>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  $0
                </div>
                <div className="text-purple-600">14 days free</div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "Full access to all subjects",
                  "AI-powered personalization",
                  "Progress tracking",
                  "Up to 2 children",
                  "Parent dashboard",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="text-green-500 w-5 h-5" />
                    <span className="text-purple-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSignup}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 px-6 rounded-2xl font-bold hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Start Free Trial
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Premium Plan</h3>
                <div className="text-4xl font-bold mb-2">$9.99</div>
                <div className="text-purple-100">per month</div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "Everything in Free Trial",
                  "Unlimited children",
                  "Advanced analytics",
                  "Priority AI improvements",
                  "Email support",
                  "Offline mode",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="text-green-300 w-5 h-5" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSignup}
                className="w-full bg-white text-purple-600 py-4 px-6 rounded-2xl font-bold hover:bg-purple-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Start with Premium
              </button>

              {/* Decorative Elements */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-purple-600">
              30-day money-back guarantee • Cancel anytime • No setup fees
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Child's Learning?
          </h2>
          <p className="text-xl mb-8 text-purple-100 leading-relaxed">
            Join thousands of families who've discovered the joy of
            personalized, AI-powered education. Your child's learning adventure
            starts today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleSignup}
              className="bg-white text-purple-600 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-purple-50 transform hover:scale-105 transition-all duration-300 shadow-xl flex items-center justify-center gap-2"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleLogin}
              className="border-2 border-white text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-white hover:text-purple-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Already have an account?
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-purple-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span>Free for 14 days</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-purple-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                  <Brain className="text-white w-4 h-4" />
                </div>
                <span className="text-lg font-bold">AI Learning Buddy</span>
              </div>
              <p className="text-purple-200 mb-4 leading-relaxed">
                Empowering children with personalized, AI-driven learning
                experiences that adapt to each child's unique needs and learning
                style.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors">
                  <span className="text-sm">📧</span>
                </div>
                <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors">
                  <span className="text-sm">📱</span>
                </div>
                <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors">
                  <span className="text-sm">🐦</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-purple-200">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#subjects"
                    className="hover:text-white transition-colors"
                  >
                    Subjects
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="hover:text-white transition-colors"
                  >
                    Reviews
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-purple-200">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <hr className="border-purple-700 my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-purple-300 text-sm">
              © 2024 AI Learning Buddy. All rights reserved.
            </p>
            <p className="text-purple-300 text-sm">
              Made with ❤️ for young learners everywhere
            </p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {videoPlaying && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-900">
                See AI Learning Buddy in Action
              </h3>
              <button
                onClick={() => setVideoPlaying(false)}
                className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <p className="text-purple-700 text-lg">
                  Demo video coming soon!
                </p>
                <p className="text-purple-600">
                  See how our AI creates personalized learning experiences
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
