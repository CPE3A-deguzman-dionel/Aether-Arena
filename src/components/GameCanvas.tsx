import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameCallbacks } from '../game/types';
interface GameCanvasProps {
  callbacks: GameCallbacks;
  engineRef: React.MutableRefObject<GameEngine | null>;
}
export const GameCanvas: React.FC<GameCanvasProps> = ({
  callbacks,
  engineRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    // Instantiate engine
    const engine = new GameEngine(canvasRef.current, callbacks);
    engineRef.current = engine;
    return () => {
      engine.cleanup();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block"
      onContextMenu={(e) => e.preventDefault()} // Prevent right click menu
    />);

};