import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import StrategyYieldPage from './components/StrategyYieldPage';
import { Home, MessageCircle, TrendingUp, ArrowRightLeft } from 'lucide-react';
import CCIPTransferModal from './components/CCIPTransferModal';
import CCIPTransferButton from './components/CCIPTransferButton';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'chat' | 'strategy-yield' | 'transfer'>('landing');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  return (
    <div className="relative">
      {/* Navigation Toggle */}
      <div className="fixed top-4 right-4 z-50 flex space-x-2">
        <button
          onClick={() => setCurrentPage('landing')}
          className={`p-3 rounded-xl transition-all duration-200 ${
            currentPage === 'landing'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
              : 'bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white border border-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentPage('chat')}
          className={`p-3 rounded-xl transition-all duration-200 ${
            currentPage === 'chat'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
              : 'bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white border border-slate-200'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentPage('strategy-yield')}
          className={`p-3 rounded-xl transition-all duration-200 ${
            currentPage === 'strategy-yield'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
              : 'bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white border border-slate-200'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsTransferModalOpen(true)}
          className={`p-3 rounded-xl transition-all duration-200 ${
            currentPage === 'transfer'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
              : 'bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white border border-slate-200'
          }`}
        >
          <ArrowRightLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Page Content */}
      {currentPage === 'landing' ? <LandingPage /> : 
       currentPage === 'chat' ? <ChatInterface /> : 
       <StrategyYieldPage />}
       
      {/* 跨链转账模态框 */}
      <CCIPTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </div>
  );
}

export default App;