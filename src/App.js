import React from 'react';
import Countdown from 'react-countdown';
import './App.css';

function App() {
  // Calculate the target date (5 seconds from now)
  const targetDate = Date.now() + 5000;

  // Custom renderer for the countdown
  const renderer = ({ seconds, completed }) => {
    if (completed) {
      return <div className="countdown-complete">SEIZURE TIME 🎉</div>;
    } else {
      return <div className="countdown-timer">{seconds}</div>;
    }
  };

  return (
    <div className="App">
      <div className="countdown-container">
        <h1>WILLIAM DANIEL!!!</h1>
        <Countdown 
          date={targetDate} 
          renderer={renderer}
        />
      </div>
    </div>
  );
}

export default App;
