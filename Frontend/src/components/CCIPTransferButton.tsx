import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import CCIPTransferModal from './CCIPTransferModal';
import { ChainId } from '../config/ccipConfig';

interface CCIPTransferButtonProps {
  className?: string;
  sourceChain?: ChainId;
  destinationChain?: ChainId;
  buttonText?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const CCIPTransferButton: React.FC<CCIPTransferButtonProps> = ({
  className = '',
  sourceChain,
  destinationChain,
  buttonText = 'Cross-Chain Transfer',
  variant = 'primary',
  size = 'md'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 根据variant确定按钮样式
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl';
      case 'secondary':
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200';
      case 'outline':
        return 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50';
      default:
        return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl';
    }
  };

  // 根据size确定按钮大小
  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-sm';
      case 'md':
        return 'px-4 py-2';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${getButtonStyle()} ${getButtonSize()} rounded-lg transition-all duration-200 flex items-center space-x-2 ${className}`}
      >
        <ArrowRightLeft className="w-4 h-4" />
        <span>{buttonText}</span>
      </button>

      <CCIPTransferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSourceChain={sourceChain}
        initialDestinationChain={destinationChain}
      />
    </>
  );
};

export default CCIPTransferButton;