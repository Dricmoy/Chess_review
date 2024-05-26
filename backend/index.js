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
  const { moves } = req.body;
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
    const scoreMatch = response.match(/score\s(cp|mate)\s(-?\d+)/);
    const depthMatch = response.match(/depth\s(\d+)/);

    const bestMove = bestMoveMatch ? bestMoveMatch[1] : 'N/A';
    const score = scoreMatch ? `${scoreMatch[1]} ${scoreMatch[2]}` : 'N/A';
    const depth = depthMatch ? depthMatch[1] : 'N/A';

    res.json({ bestMove, score, depth });
  });

  stockfish.stdin.write('uci\n');
  stockfish.stdin.write(`position startpos moves ${moves.join(' ')}\n`);
  stockfish.stdin.write('go depth 16\n');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});