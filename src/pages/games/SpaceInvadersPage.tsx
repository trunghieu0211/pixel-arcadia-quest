
import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const SpaceInvadersPage: React.FC = () => {
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
          <span className="text-neon-purple">SPACE</span>
          <span className="text-white"> </span>
          <span className="text-neon-green">INVADERS</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Defend Earth from waves of alien invaders in this iconic shooter game.
        </p>
      </div>
      
      <div className="flex justify-center items-center h-96 border-2 border-neon-purple rounded-lg bg-black/50">
        <div className="text-center">
          <h3 className="text-2xl font-pixel text-neon-purple mb-4 animate-pulse">COMING SOON</h3>
          <p className="text-gray-400">Space Invaders game is currently under development.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default SpaceInvadersPage;
