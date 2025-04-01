
import React from 'react';
import Navbar from './Navbar';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className="min-h-screen bg-arcade-background">
      <Navbar />
      <main className={`pt-16 px-4 w-full max-w-7xl mx-auto ${className}`}>
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
