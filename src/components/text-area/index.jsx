import React, {useState, useRef } from 'react'
import useSpeechToText from '../../hooks/useSpeechToText';

const TextArea = () => {
    const [textInput, setTextInput] = useState('');
    const {transcript, isListening, startListening, stopListening, getWordsPerMinute} = useSpeechToText({continuous: true});
    const [decibel, setDecibel] = useState(0); // Store the decibel value
    const audioContext = useRef(null); // Reference to the audio context
    const analyserNode = useRef(null); // Reference to the analyser node
    const microphoneStream = useRef(null); // Reference to the microphone stream
    const bufferLength = useRef(0); // Store the buffer length
    const startStopListening = () => {
        if(isListening) {
            stopVoiceInput();
        } else {
            startListening();
            startAudioAnalysis();
        }
    }

    const stopVoiceInput = () => {
        setTextInput(prevVal => prevVal + (transcript.length? (prevVal.length? ' ': '') + transcript: ''));
        stopListening();
        stopAudioAnalysis();
    }

    const startAudioAnalysis = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            microphoneStream.current = stream;
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserNode.current = audioContext.current.createAnalyser();
            const microphoneSource = audioContext.current.createMediaStreamSource(stream);
            microphoneSource.connect(analyserNode.current);
            analyserNode.current.fftSize = 256;
            bufferLength.current = analyserNode.current.frequencyBinCount;
    
            // Start the audio analysis loop
            analyzeAudio();
          })
          .catch((err) => console.error('Error accessing microphone:', err));
      };
    
      const stopAudioAnalysis = () => {
        if (microphoneStream.current) {
          microphoneStream.current.getTracks().forEach((track) => track.stop()); // Stop the stream
        }
        if (audioContext.current) {
          audioContext.current.close(); // Close the audio context
        }
      };
    
      const analyzeAudio = () => {
        if (analyserNode.current) {
          const buffer = new Uint8Array(bufferLength.current);
          analyserNode.current.getByteFrequencyData(buffer);
    
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i];
          }
    
          // Calculate the decibel value (logarithmic scale)
          const average = sum / buffer.length;
          const dB = 20 * Math.log10(average / 128); // Convert the average to decibels (range: -100 to 0)
    
          setDecibel(Math.max(dB, -100)); // Ensure the decibel value doesn't go below -100
    
          // Request the next animation frame
          requestAnimationFrame(analyzeAudio);
        }
    }

    return(
        <div >
            <button onClick={() => startStopListening()} style={{width: '300px', height: '100px', backgroundColor: '#008744', color: 'white'}}>{isListening? 'Stop speaking': 'Speak'}</button>
            <textarea
                style={{marginTop: '20px', width: '100%', height: '300px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', transition: 'border-color 0.3s ease', resize: 'none', backgroundColor: '#f8f8f8', color: '#333'}}
                value={isListening? textInput + (transcript.length ? (textInput.length? ' ': '') + transcript : ''): textInput}
                disabled={isListening}
                onChange={(event) => setTextInput(event.target.value)}            
            />
                Speed: {getWordsPerMinute()} WPM
                <div>
        <strong>Decibel Level:</strong> {Math.round(decibel)} dB
      </div>
      <div
        style={{
          marginTop: '10px',
          height: '10px',
          width: '100%',
          background: 'lightgray',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, (decibel + 100) / 100 * 100)}%`,
            backgroundColor: 'green',
          }}
        />
      </div>
    </div>
                
                
    )

}

export default TextArea;