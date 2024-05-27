import React from 'react';

const ProgressBarComponent = ({ score }) => {
    // Parse the score string to a float, removing any non-numeric characters
    const Score = parseFloat(score.replace(/[^-?\d.]/g, '')) || 0;
  
    const whitepercentage = 50 + Score / 100;
    const blackpercentage = 100 - whitepercentage;

    return (
        <div className="w-auto min-w-8">
            {/* Render solid black and white areas with dynamic widths */}
            <div className="bg-black" style={{ height: blackpercentage * 5}} />
            {/* Display the sign before the score */}
            <p className="font-sans text-xs text-center text-black absolute">{Score/100}</p>
            <div className="bg-white" style={{ height: whitepercentage * 5 }} />
        </div>
    );
};

export default ProgressBarComponent;
