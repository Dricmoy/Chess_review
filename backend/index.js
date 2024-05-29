const cors = require('cors');
const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from localhost:3000
}));
app.use(bodyParser.json());

function getEvaluation(fen, callback) {
  const stockfish = spawn('stockfish');
  let response = '';

  stockfish.stdout.on('data', (data) => {
    response += data.toString();
    if (data.toString().includes('bestmove')) {
      stockfish.stdin.write('quit\n');
    }
  });

  stockfish.on('close', () => {
    const scoreMatch = response.match(/depth\s20\s.*?\sscore\s(cp|mate)\s(-?\d+)/);

    let score = 'N/A';
    if (scoreMatch) {
      const scoreType = scoreMatch[1];
      let scoreValue = parseInt(scoreMatch[2], 10);

      const fenParts = fen.split(' ');
      const activeColor = fenParts[1];
      if (activeColor === 'b' && scoreType === 'cp') {
        scoreValue = -scoreValue;
      }

      score = scoreValue;
    }
    callback(score);
  });

  stockfish.stdin.write('uci\n');
  stockfish.stdin.write(`position fen ${fen}\n`);
  stockfish.stdin.write('go depth 20\n');
}

app.post('/analyze', (req, res) => {
  const { fen } = req.body;
  
  // Get the evaluation of the current position
  getEvaluation(fen, (evalBefore) => {
    const stockfish = spawn('stockfish');
    let response = '';

    stockfish.stdout.on('data', (data) => {
      response += data.toString();
      if (data.toString().includes('bestmove')) {
        stockfish.stdin.write('quit\n');
      }
    });

    stockfish.on('close', () => {
      const bestMoveMatch = response.match(/bestmove\s(\S+)/);
      const scoreMatch = response.match(/depth\s20\s.*?\sscore\s(cp|mate)\s(-?\d+)/);
      const depthMatches = response.match(/(?:^|\s)depth\s(\d+)(?=\s|$)/g);

      const bestMove = bestMoveMatch ? bestMoveMatch[1] : 'N/A';
      let score = 'N/A';
      let maxDepth = 0;

      if (scoreMatch) {
        const scoreType = scoreMatch[1];
        let scoreValue = parseInt(scoreMatch[2], 10);

        const fenParts = fen.split(' ');
        const activeColor = fenParts[1];
        if (activeColor === 'b' && scoreType === 'cp') {
          scoreValue = -scoreValue;
        }

        score = scoreValue;
      }

      depthMatches.forEach(match => {
          const depth = parseInt(match.match(/\d+/)[0]);
          maxDepth = Math.max(maxDepth, depth);
      });

      // Get the evaluation after the best move
      const newFen = `${fen} ${bestMove}`;
      getEvaluation(newFen, (evalAfter) => {
        const deltaEval = evalAfter - evalBefore;
        let moveQuality = 'Unknown';

        if (deltaEval > 300) {
          moveQuality = 'Brilliancy';
        } else if (-50 <= deltaEval <= 50) {
          moveQuality = 'Excellent';
        } else if (50 < deltaEval <= 100 || -100 <= deltaEval < -50) {
          moveQuality = 'Good';
        } else if (100 < deltaEval <= 200 || -200 <= deltaEval < -100) {
          moveQuality = 'Inaccuracy';
        } else if (200 < deltaEval <= 300 || -300 <= deltaEval < -200) {
          moveQuality = 'Mistake';
        } else {
          moveQuality = 'Blunder';
        }

        res.json({ bestMove, score, maxDepth, moveQuality });
      });
    });

    stockfish.stdin.write('uci\n');
    stockfish.stdin.write(`position fen ${fen}\n`);
    stockfish.stdin.write('go depth 20\n');
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
