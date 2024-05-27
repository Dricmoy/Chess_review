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
    const scoreMatch = response.match(/depth\s(\d+)\s.*\sscore\s(cp|mate)\s(-?\d+)/);

    const depthMatches = response.match(/(?:^|\s)depth\s(\d+)(?=\s|$)/g);

    const bestMove = bestMoveMatch ? bestMoveMatch[1] : 'N/A';
    const score = scoreMatch ? `${scoreMatch[2]} ${scoreMatch[3]}` : 'N/A';
    
    if (scoreMatch) {
      const depth = parseInt(scoreMatch[1]);
      if (depth === 20) {
        score = `${scoreMatch[2]} ${scoreMatch[3]}`;
      }
    }

    let maxDepth = 0;
    depthMatches.forEach(match => {
        const depth = parseInt(match.match(/\d+/)[0]);
        maxDepth = Math.max(maxDepth, depth);
    });
    
    res.json({ bestMove, score, maxDepth });
  });

  stockfish.stdin.write('uci\n');
  stockfish.stdin.write(`position fen ${fen}\n`);
  stockfish.stdin.write('go depth 20\n');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
