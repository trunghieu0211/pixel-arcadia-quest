
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import ArcadeMachine from '../components/arcade/ArcadeMachine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, Star } from 'lucide-react';

const Dashboard: React.FC = () => {
  // This would be fetched from an API in a real application
  const arcadeGames = [
    {
      title: 'TETRIS',
      description: 'The classic block-stacking puzzle game',
      path: '/games/tetris',
      color: '#00FFFF', // Cyan
      players: 12,
    },
    {
      title: 'SNAKE',
      description: 'Guide the snake to eat apples and grow longer',
      path: '/games/snake',
      color: '#00FF00', // Green
      players: 8,
    },
    {
      title: 'PONG',
      description: 'The original electronic ping-pong game',
      path: '/games/pong',
      color: '#FF00FF', // Magenta
      players: 4,
    },
    {
      title: 'PAC-MAN',
      description: 'Navigate mazes and collect dots while avoiding ghosts',
      path: '/games/pacman',
      color: '#FFFF00', // Yellow
      players: 7,
    },
    {
      title: 'SPACE INVADERS',
      description: 'Defend Earth from waves of alien invaders',
      path: '/games/space-invaders',
      color: '#9900FF', // Purple
      players: 6,
    },
    {
      title: 'BREAKOUT',
      description: 'Break through layers of bricks with a bouncing ball',
      path: '/games/breakout',
      color: '#FF5500', // Orange
      players: 3,
    },
  ];

  return (
    <PageLayout className="py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-pixel mb-4 animate-neon-pulse">
          <span className="text-neon-blue">PIXEL</span> 
          <span className="text-neon-pink">ARCADIA</span> 
          <span className="text-neon-green">QUEST</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Step into the ultimate Neo-Retro arcade experience. 
          Choose from classic games reimagined with modern effects.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-black/50 border-neon-blue/50 arcade-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-neon-blue">
              <Users className="h-5 w-5" />
              <span className="text-lg font-pixel">Players Online</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-pixel text-white">247</p>
            <p className="text-xs text-gray-400">Across all games</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/50 border-neon-pink/50 arcade-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-neon-pink">
              <Trophy className="h-5 w-5" />
              <span className="text-lg font-pixel">Popular Game</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-pixel text-white">Tetris</p>
            <p className="text-xs text-gray-400">48 active players</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/50 border-neon-green/50 arcade-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-neon-green">
              <Star className="h-5 w-5" />
              <span className="text-lg font-pixel">Total Plays</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-pixel text-white">15,423</p>
            <p className="text-xs text-gray-400">Since launch</p>
          </CardContent>
        </Card>
      </div>

      {/* Games Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-pixel mb-6 px-4">
          Select a Game
          <span className="ml-2 inline-block w-3 h-6 bg-neon-pink animate-blink"></span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {arcadeGames.map((game) => (
            <ArcadeMachine
              key={game.title}
              title={game.title}
              path={game.path}
              color={game.color}
              description={game.description}
              players={game.players}
            />
          ))}
        </div>
      </div>
      
      <div className="text-center mt-12 text-gray-500 text-sm">
        <p>More games coming soon... Stay tuned!</p>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
