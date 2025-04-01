
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import TetrisGame from '../components/games/tetris/TetrisGame';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TetrisPage: React.FC = () => {
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
          <span className="text-neon-blue">TET</span>
          <span className="text-neon-green">RIS</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          The classic block-stacking puzzle game. Clear complete lines to score points and prevent the blocks from reaching the top.
        </p>
      </div>
      
      <div className="flex justify-center">
        <TetrisGame />
      </div>
    </PageLayout>
  );
};

export default TetrisPage;
