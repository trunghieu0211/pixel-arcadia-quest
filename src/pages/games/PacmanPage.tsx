
import React, { useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import PacmanGame from '../../components/games/pacman/PacmanGame';
import type { MazeType } from '../../components/games/pacman/PacmanMaze';

const PacmanPage: React.FC = () => {
  const [selectedMaze, setSelectedMaze] = useState<MazeType>('classic');

  // Maze descriptions for selection screen
  const mazeDescriptions: Record<MazeType, { title: string; description: string; color: string }> = {
    classic: {
      title: 'Classic',
      description: 'The original maze layout with balanced pathways',
      color: '#0000FF' // Blue
    },
    neon: {
      title: 'Neon',
      description: 'Brighter maze with more complex routes',
      color: '#00FFFF' // Cyan
    },
    dark: {
      title: 'Dark',
      description: 'Larger maze with challenging paths',
      color: '#000088' // Dark blue
    },
    retro: {
      title: 'Retro',
      description: 'Simple and compact maze for quick games',
      color: '#2121DE' // Classic arcade blue
    },
    modern: {
      title: 'Modern',
      description: 'Strategic maze with interesting paths',
      color: '#3333FF' // Brighter blue
    }
  };

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
          <span className="text-neon-yellow">PAC</span>
          <span className="text-white">-</span>
          <span className="text-neon-yellow">MAN</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Navigate mazes and collect dots while avoiding colorful ghosts in this arcade classic.
        </p>
      </div>
      
      <div className="mb-6">
        <Tabs defaultValue="game" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="game" className="font-pixel">Play Game</TabsTrigger>
            <TabsTrigger value="mazes" className="font-pixel">Maze Selection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="game" className="flex justify-center">
            <PacmanGame selectedMaze={selectedMaze} />
          </TabsContent>
          
          <TabsContent value="mazes">
            <div className="max-w-2xl mx-auto p-4">
              <h2 className="text-xl font-pixel text-neon-yellow mb-4 text-center">Choose Your Maze</h2>
              
              <ScrollArea className="h-96 rounded-md border border-neon-blue/20 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(mazeDescriptions) as MazeType[]).map((mazeType) => (
                    <div 
                      key={mazeType}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedMaze === mazeType 
                          ? 'border-2 border-neon-yellow bg-black/50' 
                          : 'border border-white/10 hover:border-neon-yellow/50 bg-black/30'
                      }`}
                      onClick={() => setSelectedMaze(mazeType)}
                    >
                      <div 
                        className="aspect-square mb-4 rounded-md flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
                      >
                        {/* Maze preview visualization */}
                        <div className="w-4/5 h-4/5 relative">
                          <div 
                            className="absolute inset-0 rounded-md opacity-80"
                            style={{ 
                              backgroundColor: mazeDescriptions[mazeType].color,
                              boxShadow: `0 0 15px ${mazeDescriptions[mazeType].color}`,
                              clipPath: mazeType === 'classic' ? 'polygon(0% 0%, 100% 0%, 100% 20%, 80% 20%, 80% 40%, 100% 40%, 100% 60%, 20% 60%, 20% 80%, 100% 80%, 100% 100%, 0% 100%, 0% 80%, 60% 80%, 60% 40%, 0% 40%, 0% 20%, 40% 20%, 40% 0%)' :
                                         mazeType === 'neon' ? 'polygon(0% 0%, 100% 0%, 100% 40%, 75% 40%, 75% 20%, 50% 20%, 50% 60%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, 25% 60%, 25% 20%, 0% 20%)' :
                                         mazeType === 'dark' ? 'polygon(0% 0%, 30% 0%, 30% 30%, 70% 30%, 70% 0%, 100% 0%, 100% 100%, 70% 100%, 70% 70%, 30% 70%, 30% 100%, 0% 100%)' :
                                         mazeType === 'retro' ? 'polygon(0% 0%, 100% 0%, 100% 30%, 70% 30%, 70% 70%, 100% 70%, 100% 100%, 0% 100%, 0% 70%, 30% 70%, 30% 30%, 0% 30%)' :
                                         'polygon(10% 10%, 90% 10%, 90% 30%, 30% 30%, 30% 70%, 90% 70%, 90% 90%, 10% 90%, 10% 70%, 70% 70%, 70% 30%, 10% 30%)'
                            }}
                          ></div>
                          {/* Yellow dot for Pac-Man */}
                          <div className="absolute w-3 h-3 bg-neon-yellow rounded-full animate-pulse"
                               style={{ 
                                 left: '20%', 
                                 top: '20%',
                                 boxShadow: '0 0 5px #FFFF00'
                               }}></div>
                          {/* Ghost preview */}
                          <div className="absolute w-4 h-4 bg-red-500 rounded-t-full"
                               style={{ 
                                 left: '75%', 
                                 top: '75%',
                                 boxShadow: '0 0 5px #FF0000'
                               }}></div>
                        </div>
                      </div>
                      <h3 className="font-pixel text-center text-sm text-white">{mazeDescriptions[mazeType].title}</h3>
                      <p className="text-xs text-center text-gray-400">{mazeDescriptions[mazeType].description}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default PacmanPage;
