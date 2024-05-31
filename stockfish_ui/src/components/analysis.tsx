interface Analysis {
    bestMove: string | null;
    score: string | null;
    maxDepth: number | null;
    moveQuality: string | null;
  }
  
  interface Props {
    analysis: Analysis | null;
    moves: string[];
  }
  
  const GameAnalysis: React.FC<Props> = ({ analysis, moves }) => {
    return (
      <>
        <h3 className="text-lg font-semibold">Analysis:</h3>
        {analysis ? (
          <div>
            <p><strong>Best Move:</strong> {analysis.bestMove}</p>
            <p><strong>Score:</strong> {analysis.score}</p>
            <p><strong>Depth:</strong> {analysis.maxDepth}</p>
            <p><strong>Move Quality:</strong> {analysis.moveQuality}</p>
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
      </>
    );
  };
  
  export default GameAnalysis;

