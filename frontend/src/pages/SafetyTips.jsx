import React from 'react';
import { Link } from 'react-router-dom';
import './SafetyTips.css'; // Import the new stylesheet

const SafetyTips = () => {
  const dos = [
    "DROP to your hands and knees. COVER your head and neck with your arms. HOLD ON to a sturdy piece of furniture until shaking stops.",
    "If you are in bed, stay there. Cover your head and neck with a pillow.",
    "If you are outdoors, stay outdoors. Move away from buildings, streetlights, and utility wires.",
    "Have an emergency kit with supplies like water, food, a flashlight, and a first-aid kit.",
    "After the earthquake, check yourself for injuries and help others if you can."
  ];

  const donts = [
    "DO NOT run outside. You are more likely to be injured by falling debris.",
    "DO NOT stand in a doorway. In modern homes, doorways are no stronger than any other part of the house.",
    "DO NOT use elevators.",
    "DO NOT light a match or turn on light switches until you are sure there are no gas leaks.",
    "DO NOT spread rumors. Rely on official sources for information."
  ];

  return (
    <div className="safety-page">
      <div className="safety-header">
        <h1>Earthquake Safety Guidelines</h1>
        <p>Know how to protect yourself and your family.</p>
      </div>

      <div className="safety-grid">
        <div className="safety-column dos">
          <h2>What to Do</h2>
          {dos.map((tip, index) => (
            <div key={index} className="tip-card">
              <p>{tip}</p>
            </div>
          ))}
        </div>

        <div className="safety-column donts">
          <h2>What Not to Do</h2>
          {donts.map((tip, index) => (
            <div key={index} className="tip-card">
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="back-link-container">
          <Link to="/" className="back-link">Back to Map</Link>
      </div>
    </div>
  );
};

export default SafetyTips;