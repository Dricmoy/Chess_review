// This script sends a POST request to the /analyze endpoint

async function analyzeChessMoves(fen) {
  const url = 'http://localhost:5000/analyze';  // Replace with your server's address if different

  // Prepare the request payload
  const payload = {
    fen: fen
  };

  try {
    // Send the POST request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();
    console.log(data)
    // Log the result
    console.log('Best Move:', data.bestMove);
    console.log('Score:', data.score);
    console.log('Depth:', data.maxDepth);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Example usage:
const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";  // Replace with actual FEN string
analyzeChessMoves(fen);
