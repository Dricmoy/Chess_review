const cors = require('cors');
const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from localhost:3000
}));
app.use(bodyParser.json());

app.post('/analyze', (req, res) => {
  const { fen } = req.body;
  const stockfish = spawn('stockfish');

  let response = '';
  stockfish.stdout.on('data', (data) => {
    response += data.toString();
    if (data.toString().includes('bestmove')) {
      stockfish.stdin.write('quit\n');
      console.log(response);
    }
  });

  stockfish.on('close', () => {
    const bestMoveMatch = response.match(/bestmove\s(\S+)/);
    const scoreMatch = response.match(/depth\s20\s.*?\sscore\s(cp|mate)\s(-?\d+)/);

    const depthMatches = response.match(/(?:^|\s)depth\s(\d+)(?=\s|$)/g);

    const bestMove = bestMoveMatch ? bestMoveMatch[1] : 'N/A';
    let score = 'N/A';
    let moveQuality = 'N/A';

    if (scoreMatch) {
      const scoreType = scoreMatch[1];
      let scoreValue = parseInt(scoreMatch[2], 10);

      // Check if the player to move is Black, invert the cp score if so
      const fenParts = fen.split(' ');
      const activeColor = fenParts[1];
      if (activeColor === 'b' && scoreType === 'cp') {
        scoreValue = -scoreValue;
      }

      score = `${scoreType} ${scoreValue}`;
      moveQuality = evaluateMoveQuality(scoreValue, scoreType);
    }

    let maxDepth = 0;
    depthMatches.forEach(match => {
        const depth = parseInt(match.match(/\d+/)[0]);
        maxDepth = Math.max(maxDepth, depth);
    });
    
    res.json({ bestMove, score, maxDepth, moveQuality });
  });

  stockfish.stdin.write('uci\n');
  stockfish.stdin.write(`position fen ${fen}\n`);
  stockfish.stdin.write('go depth 20\n');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function evaluateMoveQuality(scoreValue, scoreType) {
  if (scoreType === 'mate') {
    if (scoreValue > 0) {
      return 'Brilliant';
    } else if (scoreValue < 0) {
      return 'Blunder';
    }
  } else {
    if (scoreValue > 300) {
      return 'Great Move';
    } else if (scoreValue > 100) {
      return 'Excellent';
    } else if (scoreValue > 0) {
      return 'Good';
    } else if (scoreValue === 0) {
      return 'Book';
    } else if (scoreValue < -300) {
      return 'Blunder';
    } else if (scoreValue < -100) {
      return 'Mistake';
    } else {
      return 'Inaccuracy';
    }
  }
  return 'N/A';
}
