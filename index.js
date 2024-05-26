const express = require('express');
const bodyParser = require('body-parser');
const { execFile } = require('child_process');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Path to Stockfish binary
const stockfishPath = path.join(__dirname, 'stockfish');

app.post('/analyze', (req, res) => {
  const { moves } = req.body;

  // Initialize Stockfish process
  const engine = execFile(stockfishPath, [], (error, stdout, stderr) => {
    if (error) {
      console.error(`execFile error: ${error}`);
      return res.status(500).send('Stockfish execution error');
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });

  let analysisResult = '';
  engine.stdout.on('data', (data) => {
    analysisResult += data.toString();
    if (data.toString().includes('bestmove')) {
      res.json({ analysis: analysisResult });
      engine.kill();
    }
  });

  engine.stdin.write("uci\n");
  engine.stdin.write(`position startpos moves ${moves.join(' ')}\n`);
  engine.stdin.write("go depth 20\n");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
