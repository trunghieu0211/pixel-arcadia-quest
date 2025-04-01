
import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BreakoutPage: React.FC = () => {
  return (
    <PageLayout className="py-8">
      <div className="mb-6 flex items-center">
        <Link 
          to="/" 
          className="flex items-center text-neon-blue hover:text-neon-pink transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span className="text-sm font-pixel">Back to Arcade</span>
        </Link>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-pixel mb-2">
          <span className="text-neon-blue">BREA</span>
          <span className="text-arcade-accent">KOUT</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Break through layers of bricks with a bouncing ball and a paddle in this addictive game.
        </p>
      </div>
      
      <div className="flex justify-center items-center h-96 border-2 border-arcade-accent rounded-lg bg-black/50">
        <div className="text-center">
          <h3 className="text-2xl font-pixel text-arcade-accent mb-4 animate-pulse">COMING SOON</h3>
          <p className="text-gray-400">Breakout game is currently under development.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default BreakoutPage;
