import Link from "next/link";
import { ArrowRight, Trophy, Users, Shield, Zap } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Rival
          </div>
          <Link href="/register">
            <Button>
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 sm:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Challenge Friends.
            <br />
            <span className="text-blue-600 dark:text-blue-400">Win Real Money.</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience fair, skill-based gaming with real opponents. Play Rock Paper Scissors,
            Ball in Cup, Tic Tac Toe, and Penalty Take to compete and earn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Playing Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              How It Works
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Real Opponents
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Compete against real players, not systems. Fair matches with transparent results.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Skill-Based Games
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              No gambling, pure skill. Your strategy and quick thinking determine the winner.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Secure & Fair
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              End-to-end encryption and transparent game logs ensure complete fairness.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Instant Payouts
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Win and get paid instantly through Mobile Money. No waiting, no delays.
            </p>
          </div>
        </div>

        {/* Games Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Choose Your Game
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Rock Paper Scissors', icon: '✊', description: 'Classic hand game' },
              { name: 'Ball in Cup', icon: '🏆', description: 'Find the hidden ball' },
              { name: 'Tic Tac Toe', icon: '⭕', description: 'Three in a row wins' },
              { name: 'Penalty Take', icon: '⚽', description: 'Score against the keeper' },
            ].map((game) => (
              <div key={game.name} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{game.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {game.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {game.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Register & Verify
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Sign up with your phone number and verify with OTP.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Play & Win
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Choose a game, set your stake (min 500 UGX), and compete.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Get Paid
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Winner takes the pot (minus 10% platform fee) via Mobile Money.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Challenge Your Friends?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of players already competing and winning.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Playing Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
