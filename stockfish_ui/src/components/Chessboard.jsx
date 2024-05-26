'use client';
import { useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import ProgressBarComponent from '../components/ProgressBarComponent';

const ChessboardComponent = () => {
  const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [orientation, setOrientation] = useState("white");
  const [currentPlayer, setCurrentPlayer] = useState('white');

  async function analyzeChessMoves(fen) {
    const url = 'http://localhost:5000/analyze';  // Replace with your server's address if different

    const payload = { fen: fen };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Best Move:', data.bestMove);
      console.log('Score:', data.score);
      console.log('Depth:', data.maxDepth);
      setAnalysis(data);

    } catch (error) {
      console.error('Error:', error);
    }
  }

  useEffect(() => {
    analyzeChessMoves(game.fen());
  }, [game]);

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = new Chess(g.fen());
      modify(update);
      return update;
    });
  }

  function onDrop(sourceSquare, targetSquare, piece) {
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: (sourceSquare[1] === '7' && targetSquare[1] === '8') || (sourceSquare[1] === '2' && targetSquare[1] === '1') ? 'q' : undefined,
      });

      if (move) {
        setAnalysis(null);
        setGame(gameCopy);
        setMoves((prevMoves) => [...prevMoves, move.san]);
        const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
        setCurrentPlayer(nextPlayer);
      }
    } catch (error) {
      console.error('Invalid move:', error.message);
    }
  }

  const customPieces = useMemo(() => {
    const pieceComponents = {};
    pieces.forEach((piece) => {
      pieceComponents[piece] = ({ squareWidth }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(/${piece}.png)`,
            backgroundSize: '100%',
          }}
        />
      );
    });
    return pieceComponents;
  }, []);

  return (
    <div className="flex flex-row items-start gap-8">
      <ProgressBarComponent score={analysis ? analysis.score.toString() : '0'} />
      <div>
        <Chessboard
          id="StyledBoard"
          allowDragOutsideBoard={true}
          animationDuration={300}
          areArrowsAllowed={true}
          arePiecesDraggable={true}
          arePremovesAllowed={false}
          autoPromoteToQueen={false}
          boardOrientation={orientation}
          boardWidth={560}
          clearPremovesOnRightClick={true}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
          customDarkSquareStyle={{ backgroundColor: '#779952' }}
          customLightSquareStyle={{ backgroundColor: '#edeed1' }}
          customPieces={customPieces}
          dropOffBoardAction="snapback"
          getPositionObject={(currentPosition) => console.log(currentPosition)}
          onPieceDrop={onDrop}
          position={game.fen()}
          showBoardNotation={true}
          snapToCursor={true}
        />

        <div className="mt-4 flex flex-col gap-2">
          <button className="bg-gray-800 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-700"
            onClick={() => {
              safeGameMutate((game) => {
                game.reset();
              });
              setMoves([]);
              setOrientation("white");
              setAnalysis(null);
            }}
          >
            Reset
          </button>

          <button className="bg-gray-800 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-700"
            onClick={() => {
              safeGameMutate((game) => {
                game.undo();
              });
              setMoves((prevMoves) => prevMoves.slice(0, -1));
              setTimeout(() => {
                setOrientation((prevOrientation) => (prevOrientation === "white" ? "black" : "white"));
              }, 300);
            }}
          >
            Undo
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-700"
            onClick={() => {
              setOrientation((prevOrientation) => (prevOrientation === "white" ? "black" : "white"));
            }}
          >
            Switch to {orientation === "white" ? "Black" : "White"}
          </button>
          <p>{`Player to move: ${currentPlayer}`}</p>
        </div>
      </div>

      <div className="w-[200px] bg-center bg-gray-500 rounded p-4">
        <h3 className="text-lg font-semibold">Analysis:</h3>
        {analysis ? (
          <div>
            <p><strong>Best Move:</strong> {analysis.bestMove}</p>
            <p><strong>Score:</strong> {analysis.score}</p>
            <p><strong>Depth:</strong> {analysis.maxDepth}</p>
          </div>
        ) : (
          <p>No analysis available.</p>
        )}

        <h3 className="text-lg font-semibold mt-4">Moves:</h3>
        <ul className="list-none p-0 m-0 overflow-y-auto max-h-300">
          {moves.map((move, index) => (
            <li key={index}><p>{index + 1} {move}</p></li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChessboardComponent;
