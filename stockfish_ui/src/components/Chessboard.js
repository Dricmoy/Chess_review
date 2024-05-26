"use client";
import { useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const buttonStyle = {
  cursor: "pointer",
  padding: "10px 20px",
  margin: "10px 10px 0px 0px",
  borderRadius: "6px",
  backgroundColor: "#f0d9b5",
  border: "none",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
};

const boardWrapper = {
  display: 'flex',
  alignItems: 'flex-start',
  width: '90vw',
  maxWidth: '1200px',
  margin: '3rem auto',
  gap: '2rem',
};

const chessboardStyle = {
  flexGrow: 1,
  maxWidth: '70vh',
};

const analysisStyle = {
  width: '30%',
  padding: '1rem',
  backgroundColor: '#f9f9f9',
  borderRadius: '6px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
};

const movesListStyle = {
  listStyleType: 'none',
  padding: 0,
  margin: 0,
  overflowY: 'auto',
  maxHeight: '300px',
};

const ChessboardComponent = () => {
  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [orientation, setOrientation] = useState("white");

  useEffect(() => {
    if (moves.length > 0) {
      analyzeChessMoves(moves);
    }
  }, [moves]);

  async function analyzeChessMoves(moves) {
    const url = 'http://localhost:5000/analyze';  // Replace with your server's address if different

    const payload = {
      moves: moves
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data);

    } catch (error) {
      console.error('Error:', error);
    }
  }

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = new Chess(g.fen());
      modify(update);
      return update;
    });
  }

  function onDrop(sourceSquare, targetSquare, piece) {
    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: (sourceSquare[1] === '7' && targetSquare[1] === '8') || (sourceSquare[1] === '2' && targetSquare[1] === '1') ? 'q' : undefined,
    });

    if (move) {
      setGame(gameCopy);
      setMoves((prevMoves) => [...prevMoves, move.san]);
      setTimeout(() => {
        setOrientation((prevOrientation) => (prevOrientation === "white" ? "black" : "white"));
      }, 300);
      analyzeChessMoves([...moves, move.san]); // Analyze moves after each move
      return true;
    }
    return false;
  }

  const pieces = [
    'wP', 'wN', 'wB', 'wR', 'wQ', 'wK',
    'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'
  ];

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
    <div style={boardWrapper}>
      <div style={chessboardStyle}>
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
        <div>
          <button
            style={buttonStyle}
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
          <button
            style={buttonStyle}
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
        </div>
      </div>
      <div style={analysisStyle}>
        <h3>Analysis:</h3>
        {analysis ? (
          <div>
            <p><strong>Best Move:</strong> {analysis.bestMove}</p>
            <p><strong>Score:</strong> {analysis.score}</p>
            <p><strong>Depth:</strong> {analysis.depth}</p>
          </div>
        ) : (
          <p>No analysis available.</p>
        )}
        <h3>Moves:</h3>
        <ul style={movesListStyle}>
          {moves.map((move, index) => (
            <li key={index}>{move}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChessboardComponent;
