'use client';

import Link from "next/link";
import { ArrowRight, Trophy, Users, Shield, Zap, Sparkles, TrendingUp, Star, ChevronRight, Flame, Crown } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function StakeHomePage() {
  
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
      icon: TrendingUp,
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
    { name: 'Rock Paper Scissors', icon: '✊', difficulty: 'Easy', players: '1v1', minStake: 500 },
    { name: 'Ball in Cup', icon: '🏆', difficulty: 'Medium', players: '1v1', minStake: 500 },
    { name: 'Tic Tac Toe', icon: '⭕', difficulty: 'Easy', players: '1v1', minStake: 500 },
    { name: 'Penalty Take', icon: '⚽', difficulty: 'Hard', players: '1v1', minStake: 500 }
  ];

  const testimonials = [
    {
      name: "Alex K.",
      username: "@alex_winner",
      content: "Won UGX 50,000 in my first week! The games are fair and payouts are instant.",
      winnings: "UGX 125,000",
      avatar: "👤"
    },
    {
      name: "Sarah M.",
      username: "@sarah_pro",
      content: "Best P2P gaming platform in Uganda. The competition is real and the rewards are amazing!",
      winnings: "UGX 89,000",
      avatar: "👩"
    },
    {
      name: "John D.",
      username: "@john_champion",
      content: "Love the variety of games and the mobile money integration is seamless.",
      winnings: "UGX 200,000",
      avatar: "👨"
    }
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

          <div className="flex items-center space-x-6">
            <Link href="#games" className="text-gray-300 hover:text-white transition-colors">
              Games
            </Link>
            <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 sm:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Badge variant="glow" className="mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Uganda's Premier P2P Gaming Platform
              </Badge>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
                <h1 className="text-5xl sm:text-7xl font-black">
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
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Experience Uganda's premier competitive gaming platform. Battle real players in skill-based games,
                stake with Mobile Money, and claim your victories instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 text-lg px-8 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
                    Start Playing Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#games">
                  <Button variant="outline" size="lg" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 text-lg px-8 py-4 rounded-xl">
                    View Games
                  </Button>
                </Link>
              </div>
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
              Built for competitive gamers who demand fairness, speed, and real rewards
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

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              What <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Winners</span> Say
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Real Ugandan players, real wins, real money
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="glass" className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white">{testimonial.name}</h3>
                        <Crown className="w-4 h-4 text-yellow-500" />
                      </div>
                      <p className="text-sm text-gray-400">{testimonial.username}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="success" className="text-xs">
                      Total Winnings: {testimonial.winnings}
                    </Badge>
                    <Star className="w-4 h-4 text-yellow-500" />
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
              Get started in 3 simple steps and join thousands of winners
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
                  <Link href="/register">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 text-lg px-12 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300">
                      Start Winning Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
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
    </div>
  );
}