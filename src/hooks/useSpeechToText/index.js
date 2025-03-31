import React,{useEffect, useState, useRef} from "react";

const useSpeechToText = (options) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef(null);
    const [startTime, setStartTime] = useState(null);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported");
            return
        }

        recognitionRef.current = new window.webkitSpeechRecognition();
        const recognition = recognitionRef.current;
        recognition.interimResults = options.interimResults || true;
        recognition.lang = options.lang || 'en-US';
        recognition.continuous = options.continuous || false;

        if('webkitSpeechGrammarList' in window) {
            const grammar = '#JSGF V1.0; grammar punctuation; public <punc> = . | , | ? | ! | ; | : ;';
            const speechRecognitionList = new window.webkitSpeechGrammarList(); 
            speechRecognitionList.addFromString(grammar, 1);
            recognition.grammars = speechRecognitionList;
        }

        recognition.onresult = (event) => {
            let text = '';
            for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript;
            }
            setTranscript(text) 
        }

        recognition.onerror = (event) => {
            console.error(event.error);
        }

        recognition.onend = () => {
            setIsListening(false)
            setTranscript('')
            console.log("End speech recognition");
        }

        return () => {
            recognition.stop();
        }


    },[])


    const startListening = () => {
        if(recognitionRef.current && !isListening) {
            recognitionRef.current.start();
            setIsListening(true)
            setStartTime(Date.now());

        }
    }
    const getWordsPerMinute = () => {
        if (!startTime) return 0;

        const duration = (Date.now() - startTime) / 60000; // Convert duration to minutes
        const wordCount = transcript.split(" ").length;
        return Math.round(wordCount / duration);
    };

    const stopListening = () => {
        if(recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false)
            setDuration(Date.now() - startTime); // Calculate duration in ms

        }
    }

    return {
        
            isListening, 
            transcript,
            startListening,
            stopListening,
            getWordsPerMinute
        
    }
}

export default useSpeechToText;