// This script sends a POST request to the /analyze endpoint

async function analyzeChessMoves(moves) {
    const url = 'http://localhost:5000/analyze';  // Replace with your server's address if different
  
    // Prepare the request payload
    const payload = {
      moves: moves
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
  
      // Log the result
      console.log('Best Move:', data.bestMove);
      console.log('Score:', data.score);
      console.log('Depth:', data.depth);
  
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  // Example usage:
  const moves = ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'g8f6', 'd2d3'];  // Replace with actual moves
  analyzeChessMoves(moves);
  