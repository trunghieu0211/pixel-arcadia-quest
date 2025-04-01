
import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const SnakePage: React.FC = () => {
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
          <span className="text-neon-green">SNA</span>
          <span className="text-neon-yellow">KE</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Guide the snake to eat apples and grow longer without hitting walls or yourself.
        </p>
      </div>
      
      <div className="flex justify-center items-center h-96 border-2 border-neon-green rounded-lg bg-black/50">
        <div className="text-center">
          <h3 className="text-2xl font-pixel text-neon-green mb-4 animate-pulse">COMING SOON</h3>
          <p className="text-gray-400">Snake game is currently under development.</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default SnakePage;
