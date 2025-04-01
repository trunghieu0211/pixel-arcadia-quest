
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TetrisPage from "./pages/TetrisPage";
import NotFound from "./pages/NotFound";

// Game pages (placeholders for now)
import SnakePage from "./pages/games/SnakePage";
import PongPage from "./pages/games/PongPage";
import PacmanPage from "./pages/games/PacmanPage";
import SpaceInvadersPage from "./pages/games/SpaceInvadersPage";
import BreakoutPage from "./pages/games/BreakoutPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          
          {/* Game Routes */}
          <Route path="/games/tetris" element={<TetrisPage />} />
          <Route path="/games/snake" element={<SnakePage />} />
          <Route path="/games/pong" element={<PongPage />} />
          <Route path="/games/pacman" element={<PacmanPage />} />
          <Route path="/games/space-invaders" element={<SpaceInvadersPage />} />
          <Route path="/games/breakout" element={<BreakoutPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
