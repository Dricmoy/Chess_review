import React from 'react';

const ProgressBarComponent = ({ score }) => {
  // Parse the score string to a float, removing any non-numeric characters
    const Score = parseFloat(score.replace(/[^-?\d.]/g, ''));
  
    const whitepercentage = 50 + Score/100;
    const blackpercentage = 100-whitepercentage;

    return (
    <div className="h-full w-4 mt-4 rounded-full flex flex-col">
        {/* Render solid black and white areas with dynamic widths */}
        <div className="bg-black w-full" style={{ height: blackpercentage}} />
        <div className="bg-white w-full" style={{ height: whitepercentage }} />
    </div>
    );
};

export default ProgressBarComponent;
