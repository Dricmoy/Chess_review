import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import axios from 'axios';

const ChessboardComponent = () => {
  const [gameState, setGameState] = useState('start');
  const [moves, setMoves] = useState([]);

  const onDrop = async (sourceSquare, targetSquare) => {
    const move = `${sourceSquare}${targetSquare}`;
    setMoves([...moves, move]);

    try {
      const response = await axios.post('http://localhost:5000/analyze', {
        moves: [...moves, move],
      });
      console.log('Analysis:', response.data);
    } catch (error) {
      console.error('Error analyzing move:', error);
    }
  };

  return (
    <div>
      <Chessboard position={gameState} onPieceDrop={onDrop} />
    </div>
  );
};

export default ChessboardComponent;
