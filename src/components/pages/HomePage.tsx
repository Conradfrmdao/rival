'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Users, Shield, Zap, Sparkles, Eye, EyeOff, Star, ChevronRight, Flame, Crown } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import GameImage from "@/components/games/GameImages";

export default function HomePage() {
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupUsername, setSignupUsername] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant matchmaking and real-time gameplay with sub-second latency",
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      icon: Shield,
      title: "100% Fair Play",
      description: "Blockchain-verified randomness and transparent game mechanics",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Star,
      title: "Skill-Based",
      description: "Pure strategy determines winners - no luck, no gambling",
      gradient: "from-green-500 to-teal-600"
    },
    {
      icon: Users,
      title: "Real Players",
      description: "Compete against genuine opponents from across Africa",
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  const games = [
    { name: 'Penalty Take', icon: '⚽', difficulty: 'Hard', players: '1v1', minStake: 500 },
    { name: 'Ball in Cup', icon: '🏆', difficulty: 'Medium', players: '1v1', minStake: 500 },
    { name: 'Rock Paper Scissors', icon: '✊', difficulty: 'Easy', players: '1v1', minStake: 500 },
    { name: 'Tic Tac Toe', icon: '⭕', difficulty: 'Easy', players: '1v1', minStake: 500 }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 blur-lg rounded-full opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-2">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Rival
              </h1>
              <span className="text-xs text-gray-400 uppercase tracking-wider">P2P Gaming</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="#games" className="text-gray-300 hover:text-white transition-colors">
              Games
            </Link>
            <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/dashboard">
              <Button variant="glass">Dashboard</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="glass" size="sm" className="text-white">
              Menu
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section with Login/Signup */}
        <section className="max-w-7xl mx-auto px-6 py-20 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <Badge variant="glow" className="mb-6 inline-flex">
                <Sparkles className="w-4 h-4 mr-2" />
                Uganda's Premier P2P Gaming Platform
              </Badge>
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                    Challenge. Compete.
                  </span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    Win Real Money.
                  </span>
                </h1>
                <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
              </div>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Experience Uganda's premier competitive gaming platform. Battle real players in skill-based games,
                stake with Mobile Money, and claim your victories instantly.
              </p>
            </motion.div>

            {/* Right Side - Login/Signup Forms */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card variant="glass" className="p-8 backdrop-blur-xl border border-purple-500/20">
                <div className="flex mb-6 bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                      activeTab === 'login'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setActiveTab('signup')}
                    className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                      activeTab === 'signup'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {activeTab === 'login' ? (
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="2567XX000000"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2 rounded" />
                        <span className="text-gray-300">Remember me</span>
                      </label>
                      <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300">
                        Forgot password?
                      </Link>
                    </div>
                    <Button
                      type="submit"
                      fullWidth
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 py-3"
                    >
                      Login to Play
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                ) : (
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        placeholder="Choose a username"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="2567XX000000"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Create a strong password"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showSignupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="text-sm">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2 rounded" required />
                        <span className="text-gray-300">
                          I agree to the{' '}
                          <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                            Terms & Conditions
                          </Link>
                        </span>
                      </label>
                    </div>
                    <Button
                      type="submit"
                      fullWidth
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 py-3"
                    >
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Players Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Rival</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built for Ugandan competitive gamers who demand fairness, speed, and real rewards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="glass" className="group hover:scale-105 transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Games */}
        <section id="games" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Battle</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Master 4 unique games. Each requires strategy, speed, and skill to dominate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="glass" className="group cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-t-xl" />
                    <div className="relative p-6">
                      <div className="text-5xl mb-4 text-center group-hover:scale-125 transition-transform duration-300">
                        {game.icon}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 text-center">{game.name}</h3>
                      <div className="flex justify-center gap-2 mb-4">
                        <Badge variant="info" size="sm">{game.difficulty}</Badge>
                        <Badge variant="default" size="sm">{game.players}</Badge>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-400">Min Stake</div>
                        <div className="text-lg font-bold text-green-400">UGX {game.minStake}</div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-white/10 p-4">
                    <Button fullWidth className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 text-white border border-purple-500/30">
                      Play Now
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How to Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Winning</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get started in 3 simple steps and join thousands of Ugandan winners
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Register & Verify",
                description: "Sign up with your phone number and verify with OTP. Takes less than 60 seconds.",
                icon: Users
              },
              {
                step: "02",
                title: "Deposit & Play",
                description: "Add funds via Mobile Money. Choose your game, set your stake, and start competing.",
                icon: Zap
              },
              {
                step: "03",
                title: "Win & Withdraw",
                description: "Victory means instant cashout. Withdraw winnings to your Mobile Money in seconds.",
                icon: Trophy
              }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <Card variant="glass" className="relative group">
                  <div className="absolute -top-4 left-6 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {step.step}
                  </div>
                  <div className="pt-8 p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-32">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl" />
            <Card variant="glass" className="relative text-center p-12 md:p-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="glow" className="mb-6">
                  <Star className="w-4 h-4 mr-2" />
                  Join Uganda's Winners
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Dominate</span>?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of Ugandan players winning real money daily.
                  Your competition is waiting. Your victory is one battle away.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 text-lg px-12 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
                    Start Winning Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Link href="#games">
                    <Button variant="outline" size="lg" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 text-lg px-12 py-4 rounded-xl">
                      View Games
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-2">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Rival
              </span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">
                © 2025 Naughty Code Systems. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Uganda's Premier P2P Gaming Platform | Play Responsibly | 18+ Only
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}