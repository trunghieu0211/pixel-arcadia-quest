
import React, { useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SnakeGame from '../../components/games/snake/SnakeGame';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define snake skin types
export type SnakeSkin = 'classic' | 'neon' | 'robot';

const SnakePage: React.FC = () => {
  const [selectedSkin, setSelectedSkin] = useState<SnakeSkin>('classic');

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
      
      <div className="mb-6">
        <Tabs defaultValue="game" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="game" className="font-pixel">Play Game</TabsTrigger>
            <TabsTrigger value="skins" className="font-pixel">Snake Skins</TabsTrigger>
          </TabsList>
          
          <TabsContent value="game" className="flex justify-center">
            <SnakeGame selectedSkin={selectedSkin} />
          </TabsContent>
          
          <TabsContent value="skins">
            <div className="max-w-2xl mx-auto p-4">
              <h2 className="text-xl font-pixel text-neon-pink mb-4 text-center">Choose Your Snake</h2>
              
              <ScrollArea className="h-64 rounded-md border border-neon-blue/20 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Classic Snake */}
                  <div 
                    className={`p-4 rounded-lg cursor-pointer transition-all ${selectedSkin === 'classic' 
                      ? 'border-2 border-neon-green bg-black/50' 
                      : 'border border-white/10 hover:border-neon-green/50 bg-black/30'}`}
                    onClick={() => setSelectedSkin('classic')}
                  >
                    <div className="aspect-square mb-2 bg-black/60 rounded-md flex items-center justify-center overflow-hidden">
                      <div className="w-3/4 h-3/4 relative">
                        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-neon-green rounded-md border border-neon-green/50 shadow-lg shadow-neon-green/20"></div>
                        <div className="absolute top-1/4 left-1/2 w-1/4 h-1/4 bg-neon-green rounded-md border border-neon-green/50"></div>
                        <div className="absolute top-1/2 left-1/2 w-1/4 h-1/4 bg-neon-green rounded-md border border-neon-green/50"></div>
                      </div>
                    </div>
                    <h3 className="font-pixel text-center text-sm text-white">Classic</h3>
                    <p className="text-xs text-center text-gray-400">The original pixel snake</p>
                  </div>
                  
                  {/* Neon Snake */}
                  <div 
                    className={`p-4 rounded-lg cursor-pointer transition-all ${selectedSkin === 'neon' 
                      ? 'border-2 border-neon-pink bg-black/50' 
                      : 'border border-white/10 hover:border-neon-pink/50 bg-black/30'}`}
                    onClick={() => setSelectedSkin('neon')}
                  >
                    <div className="aspect-square mb-2 bg-black/60 rounded-md flex items-center justify-center overflow-hidden">
                      <div className="w-3/4 h-3/4 relative">
                        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-neon-pink rounded-md border border-neon-pink/50 shadow-lg shadow-neon-pink/30"></div>
                        <div className="absolute top-1/4 left-1/2 w-1/4 h-1/4 bg-neon-pink rounded-md border border-neon-pink/50"></div>
                        <div className="absolute top-1/2 left-1/2 w-1/4 h-1/4 bg-neon-pink rounded-md border border-neon-pink/50"></div>
                      </div>
                    </div>
                    <h3 className="font-pixel text-center text-sm text-white">Neon</h3>
                    <p className="text-xs text-center text-gray-400">Bright and electric</p>
                  </div>
                  
                  {/* Robot Snake */}
                  <div 
                    className={`p-4 rounded-lg cursor-pointer transition-all ${selectedSkin === 'robot' 
                      ? 'border-2 border-neon-blue bg-black/50' 
                      : 'border border-white/10 hover:border-neon-blue/50 bg-black/30'}`}
                    onClick={() => setSelectedSkin('robot')}
                  >
                    <div className="aspect-square mb-2 bg-black/60 rounded-md flex items-center justify-center overflow-hidden">
                      <div className="w-3/4 h-3/4 relative">
                        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-neon-blue rounded-md border border-neon-blue/50 shadow-lg shadow-neon-blue/30"></div>
                        <div className="absolute top-1/4 left-1/2 w-1/4 h-1/4 bg-neon-blue rounded-md border border-neon-blue/50"></div>
                        <div className="absolute top-1/2 left-1/2 w-1/4 h-1/4 bg-neon-blue rounded-md border border-neon-blue/50"></div>
                      </div>
                    </div>
                    <h3 className="font-pixel text-center text-sm text-white">Robot</h3>
                    <p className="text-xs text-center text-gray-400">Mechanical and sleek</p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SnakePage;
