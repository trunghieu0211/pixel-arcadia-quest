
import React, { useState, useEffect } from 'react';
import PageLayout from '../components/layout/PageLayout';
import ArcadeMachine from '../components/arcade/ArcadeMachine';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const [totalPlays, setTotalPlays] = useState(12567);
  const [onlineUsers, setOnlineUsers] = useState(142);
  
  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setOnlineUsers(prev => Math.max(100, prev + Math.floor(Math.random() * 5) - 2));
      setTotalPlays(prev => prev + Math.floor(Math.random() * 10));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const games = [
    {
      id: 'tetris',
      title: 'Tetris',
      path: '/games/tetris',
      color: '#00FFFF',
      description: 'Classic block-stacking puzzle game',
      players: 37
    },
    {
      id: 'snake',
      title: 'Snake',
      path: '/games/snake',
      color: '#00FF00',
      description: 'Grow your snake by eating food',
      players: 24
    },
    {
      id: 'pong',
      title: 'Pong',
      path: '/games/pong',
      color: '#FFFFFF',
      description: 'The original arcade classic',
      players: 16
    },
    {
      id: 'pacman',
      title: 'Pac-Man',
      path: '/games/pacman',
      color: '#FFFF00',
      description: 'Eat dots, avoid ghosts',
      players: 29
    },
    {
      id: 'space-invaders',
      title: 'Space Invaders',
      path: '/games/space-invaders',
      color: '#FF00FF',
      description: 'Defend Earth from alien invasion',
      players: 22
    },
    {
      id: 'breakout',
      title: 'Breakout',
      path: '/games/breakout',
      color: '#FF5500',
      description: 'Break all the bricks with a ball',
      players: 18
    },
    {
      id: 'minesweeper',
      title: 'Minesweeper',
      path: '/games/minesweeper',
      color: '#FF0000',
      description: 'Find all mines without triggering them',
      players: 14
    },
    {
      id: 'memory',
      title: 'Memory Match',
      path: '/games/memory',
      color: '#9900FF',
      description: 'Find matching pairs of cards',
      players: 20
    },
    {
      id: 'frogger',
      title: 'Frogger',
      path: '/games/frogger',
      color: '#00FF99',
      description: 'Cross the road and river safely',
      players: 12
    },
    {
      id: 'flappy',
      title: 'Flappy Bird',
      path: '/games/flappy',
      color: '#FFAA00',
      description: 'Navigate through pipes without touching',
      players: 31
    }
  ];
  
  return (
    <PageLayout className="py-8">
      <div className="text-center mb-16">
        <motion.h1 
          className="text-4xl md:text-6xl font-pixel mb-4 text-white neon-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-neon-pink">PIXEL</span> 
          <span className="text-neon-blue">ARCADIA</span> 
          <span className="text-neon-green">QUEST</span>
        </motion.h1>
        
        <motion.p 
          className="text-lg text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Welcome to the ultimate retro arcade experience, reimagined for the modern web.
        </motion.p>
      </div>
      
      <div className="mb-12 grid grid-cols-2 gap-6 max-w-lg mx-auto">
        <div className="bg-black/50 border border-neon-blue rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Players Online</p>
          <p className="font-pixel text-2xl text-neon-blue animate-pulse">{onlineUsers}</p>
        </div>
        
        <div className="bg-black/50 border border-neon-pink rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">Total Plays</p>
          <p className="font-pixel text-2xl text-neon-pink animate-pulse">{totalPlays.toLocaleString()}</p>
        </div>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {games.map((game, index) => (
          <motion.div 
            key={game.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
          >
            <ArcadeMachine {...game} />
          </motion.div>
        ))}
      </motion.div>
    </PageLayout>
  );
};

export default Dashboard;
