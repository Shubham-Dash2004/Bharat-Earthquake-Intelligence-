import React, { useState, useEffect, useCallback } from 'react';
import './AlertManager.css';

const AlertManager = ({ newAlerts }) => {
  const [alertQueue, setAlertQueue] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeechEngineReady, setIsSpeechEngineReady] = useState(false);

  // This effect runs once to safely initialize the browser's speech engine.
  useEffect(() => {
    const handleVoicesChanged = () => {
      setIsSpeechEngineReady(true);
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };

    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      // Safety timeout in case the event doesn't fire
      setTimeout(() => setIsSpeechEngineReady(true), 1500);
    } else {
      // If speech is not supported, consider it "ready" for text-only alerts.
      setIsSpeechEngineReady(true);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      }
    };
  }, []);

  // This effect adds incoming new alerts to our internal queue.
  useEffect(() => {
    if (newAlerts && newAlerts.length > 0) {
      setAlertQueue(prevQueue => [...prevQueue, ...newAlerts]);
    }
  }, [newAlerts]);

  // This function handles the speaking and returns a Promise that resolves when speech is done.
  const speakAlert = (alert) => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window && isSpeechEngineReady) {
        const message = `New earthquake alert. A magnitude ${alert.magnitude} earthquake has been detected near ${alert.description}`;
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        
        // The 'onend' event tells us when the browser has finished speaking.
        utterance.onend = () => {
          resolve();
        };

        // Safety fallback: if speech fails, resolve after 12 seconds.
        setTimeout(() => resolve(), 12000);

        window.speechSynthesis.speak(utterance);
      } else {
        // If speech not supported, just wait a standard 8 seconds for the text alert.
        setTimeout(() => resolve(), 8000);
      }
    });
  };

  // This is the main queue processing function.
  const processQueue = useCallback(async () => {
    // It will not run until the queue has items AND the speech engine is ready.
    if (isProcessing || alertQueue.length === 0 || !isSpeechEngineReady) {
      return;
    }

    setIsProcessing(true);
    const nextAlert = alertQueue[0];
    setCurrentAlert(nextAlert);

    // This waits for the voice to finish speaking before continuing.
    await speakAlert(nextAlert);

    // This code only runs AFTER the speech is complete.
    setCurrentAlert(null);
    setAlertQueue(prevQueue => prevQueue.slice(1));
    setIsProcessing(false);

  }, [alertQueue, isProcessing, isSpeechEngineReady]);

  // This effect triggers the queue processor whenever its dependencies change.
  useEffect(() => {
    processQueue();
  }, [processQueue]);


  // If there is no alert currently being displayed, render nothing.
  if (!currentAlert) {
    return null;
  }

  // The JSX for the visual on-screen notification.
  return (
    <div className="alert-toast">
      <div className="alert-header">New Earthquake Detected</div>
      <div className="alert-body">
        <strong>Magnitude {currentAlert.magnitude}</strong> - {currentAlert.description}
      </div>
    </div>
  );
};

export default AlertManager;