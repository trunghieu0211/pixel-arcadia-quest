
import React from 'react';
import { Link } from 'react-router-dom';

interface ArcadeMachineProps {
  title: string;
  path: string;
  color: string;
  image?: string;
  description: string;
  players?: number;
}

const ArcadeMachine: React.FC<ArcadeMachineProps> = ({ 
  title, 
  path, 
  color, 
  image, 
  description,
  players = 0
}) => {
  return (
    <Link 
      to={path}
      className="group relative flex flex-col bg-black border-2 rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:z-10"
      style={{ 
        borderColor: color,
        boxShadow: `0 0 15px ${color}66, 0 0 30px ${color}33`
      }}
    >
      {/* Arcade machine top */}
      <div 
        className="w-full h-6 flex items-center justify-center text-xs font-pixel"
        style={{ backgroundColor: color }}
      >
        {title}
      </div>
      
      {/* Machine screen */}
      <div className="relative w-full aspect-square bg-black border-t border-b border-gray-800 overflow-hidden">
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/80"
          style={{ 
            backgroundImage: image ? `url(${image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay'
          }}
        >
          {!image && (
            <h3 
              className="text-2xl font-pixel text-center text-glow"
              style={{ color }}
            >
              {title}
            </h3>
          )}
          
          {/* Scanlines effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-transparent bg-[length:100%_4px] bg-repeat" 
            style={{ backgroundImage: 'linear-gradient(transparent 50%, rgba(0, 0, 0, 0.5) 50%)' }}
          ></div>
          
          {/* Screen reflection */}
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white via-transparent to-transparent"></div>
        </div>
      </div>
      
      {/* Machine base */}
      <div className="w-full p-3 bg-gray-900">
        <p className="text-xs text-gray-400 truncate">{description}</p>
        
        {players > 0 && (
          <div className="mt-2 flex items-center text-xs">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-green-400">{players} playing now</span>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="w-full h-10 flex items-center justify-between px-3 py-2 bg-gray-800">
        <div className="flex space-x-1.5">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="w-2.5 h-2.5 rounded-full bg-gray-600 group-hover:bg-red-500"
              style={{ 
                transitionDelay: `${i * 50}ms`,
                boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.3)'
              }}
            ></div>
          ))}
        </div>
        <div className="w-5 h-5 rounded-full bg-red-600 group-hover:bg-red-500 transition-colors" style={{ 
          boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.2), 0 0 8px rgba(255,0,0,0.6)' 
        }}></div>
      </div>
      
      {/* Play now overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="px-4 py-2 bg-black/80 border-2 rounded font-pixel text-sm animate-pulse"
          style={{ 
            borderColor: color,
            color: color
          }}
        >
          PLAY NOW
        </div>
      </div>
    </Link>
  );
};

export default ArcadeMachine;
