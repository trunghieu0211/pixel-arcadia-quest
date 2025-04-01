
import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad, User, Trophy, Settings } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-3 px-6 bg-black/70 backdrop-blur-md border-b border-neon-blue/30">
      <Link to="/" className="flex items-center gap-2">
        <Gamepad className="h-6 w-6 text-neon-blue animate-pulse" />
        <h1 className="text-xl font-pixel text-white">
          <span className="text-neon-pink">P</span>
          <span className="text-neon-blue">I</span>
          <span className="text-neon-green">X</span>
          <span className="text-neon-yellow">E</span>
          <span className="text-neon-purple">L</span>
          <span> ARCADIA</span>
        </h1>
      </Link>
      
      <div className="flex gap-4">
        <Link 
          to="/games" 
          className="flex items-center gap-1 px-3 py-1 text-sm font-pixel text-white/80 hover:text-neon-blue transition-colors"
        >
          <Gamepad className="h-4 w-4" />
          <span className="hidden sm:inline">Games</span>
        </Link>
        
        <Link 
          to="/leaderboard" 
          className="flex items-center gap-1 px-3 py-1 text-sm font-pixel text-white/80 hover:text-neon-green transition-colors"
        >
          <Trophy className="h-4 w-4" />
          <span className="hidden sm:inline">Leaderboard</span>
        </Link>
        
        <Link 
          to="/profile" 
          className="flex items-center gap-1 px-3 py-1 text-sm font-pixel text-white/80 hover:text-neon-yellow transition-colors"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </Link>
        
        <Link 
          to="/settings" 
          className="flex items-center gap-1 px-3 py-1 text-sm font-pixel text-white/80 hover:text-neon-purple transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
