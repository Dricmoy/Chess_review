'use client';
import { useRef, useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import ProgressBarComponent from '../components/ProgressBarComponent';
import GameAnalysis from '../components/analysis';

const ChessboardComponent = () => {
  const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [orientation, setOrientation] = useState("white");
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [fenHistory, setFenHistory] = useState([game.fen()]);
  const inputRef = useRef();

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
      console.log('Move Quality:', data.moveQuality);
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

    setFenHistory((history) => [...history, game.fen()]); 
  }

  function onDrop(sourceSquare, targetSquare) {
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
        setFenHistory((history) => [...history, gameCopy.fen()]);
      }
    } catch (error) {
      console.error('Invalid move:', error.message);
    }
  }

  function handleUndo() {
    if (fenHistory.length > 1) {
      const previousFen = fenHistory[fenHistory.length - 2]; // Get the previous FEN string
      setFenHistory((history) => history.slice(0, -1)); // Pop the last FEN string
      setMoves((prevMoves) => prevMoves.slice(0, -1)); // Remove the last move from moves array
      setCurrentPlayer((prevPlayer) => (prevPlayer === 'white' ? 'black' : 'white')); // Switch player
      setGame(new Chess(previousFen)); // Load the previous FEN string
    }
  }
  
  const bestMove = analysis ? analysis.bestMove : null;
  
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

  const inputStyle = {
    padding: "10px 20px",
    margin: "10px 0 10px 0",
    borderRadius: "6px",
    border: "none",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
  };

  const handleFenInputChange = (e) => {
    const fenString = e.target.value;
  
    // Regular expression pattern for validating FEN format
    const fenPattern = /^([prnbqkPRNBQK1-8]{1,8}\/){7}[prnbqkPRNBQK1-8]{1,8}\s[w|b]\s(K?Q?k?q?|-)\s?([a-h][1-8]|-)\s?\d+\s\d+$/;
  
    // Check if the input string matches the FEN format
    if (fenPattern.test(fenString)) {
      inputRef.current.value = fenString;
      const updatedGame = new Chess(fenString);
      setGame(updatedGame);
      setChessBoardPosition(updatedGame.fen());
    } else {
      console.error('Invalid FEN string:', fenString);
    }
  };
  
  return (
    <div className="flex flex-row items-start gap-8">
      <div className='ml-10 mt-10 flex border items-center'>
        <ProgressBarComponent score={analysis ? analysis.score.toString() : '0'} />
      </div>

      <div>

        <div className=''>
          <input
            ref={inputRef}
            style={{ ...inputStyle, width: "90%" }}
            onChange={handleFenInputChange}
            placeholder="Paste FEN to start analysing custom position"
          />
        </div>
        
        <Chessboard
          id="StyledBoard"
          allowDragOutsideBoard={true}
          animationDuration={300}
          areArrowsAllowed={true}
          arePiecesDraggable={true}
          autoPromoteToQueen={false}
          boardOrientation={orientation}
          boardWidth={560}
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
          customArrows={
            bestMove && [
              [
                bestMove.substring(0, 2),
                bestMove.substring(2, 4),
                "rgb(0, 128, 0)",
              ],
            ]
          }
        />

        {/*these are the reset, undo and switch orientation buttons*/}
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
            onClick={(handleUndo)}
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
      
      {/*this is the user interface for the game moves and their analysis*/}
      <div className="w-[200px] bg-center bg-gray-800 rounded p-4">
        <GameAnalysis analysis={analysis} moves={moves} />
      </div>

    </div>
  );
};

export default ChessboardComponent;
