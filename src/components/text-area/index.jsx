import React, {useState} from 'react'
import useSpeechToText from '../../hooks/useSpeechToText';

const TextArea = () => {
    const [textInput, setTextInput] = useState('');
    const {transcript, isListening, startListening, stopListening} = useSpeechToText({continuous: true});

    const startStopListening = () => {
        if(isListening) {
            stopVoiceInput();
        } else {
            startListening();
        }
    }

    const stopVoiceInput = () => {
        setTextInput(prevVal => prevVal + (transcript.length? (prevVal.length? ' ': '') + transcript: ''));
        stopListening();
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
        </div>
    )

}

export default TextArea;