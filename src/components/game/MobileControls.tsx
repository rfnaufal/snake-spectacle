import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Direction } from '@/types/game';

interface MobileControlsProps {
  onDirectionChange: (direction: Direction) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onDirectionChange }) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-40">
      <div />
      <Button
        variant="neon"
        size="icon"
        className="h-12 w-12"
        onClick={() => onDirectionChange('UP')}
      >
        <ChevronUp className="w-6 h-6" />
      </Button>
      <div />
      <Button
        variant="neon"
        size="icon"
        className="h-12 w-12"
        onClick={() => onDirectionChange('LEFT')}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <div />
      <Button
        variant="neon"
        size="icon"
        className="h-12 w-12"
        onClick={() => onDirectionChange('RIGHT')}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>
      <div />
      <Button
        variant="neon"
        size="icon"
        className="h-12 w-12"
        onClick={() => onDirectionChange('DOWN')}
      >
        <ChevronDown className="w-6 h-6" />
      </Button>
      <div />
    </div>
  );
};
