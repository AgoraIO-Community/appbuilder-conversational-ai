import React, {useRef, useState, useEffect} from 'react';
import {IMicrophoneAudioTrack, IRemoteAudioTrack, ILocalAudioTrack} from "agora-rtc-sdk-ng";


export const ActiveSpeakerAnimation = ({ audioTrack, isMuted }: { audioTrack: ILocalAudioTrack | IRemoteAudioTrack | null, isMuted: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
    const previousDataRef = useRef<Uint8Array | null>(null);
    const frameCountRef = useRef(0);
  
    console.log({audioTrack}, "activeSpeaker", isMuted)
    useEffect(() => {
      if (!audioTrack || isMuted) {
        // Clean up if track is null or muted
        if (audioContext) {
          audioContext.state !== 'closed' && audioContext.close();
          setAudioContext(null);
          setAnalyser(null);
          setDataArray(null);
        }
        return;
      }
      console.log("created audio context")
      // Create a new AudioContext
      const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Create an analyser node
      const newAnalyser = newAudioContext.createAnalyser();
      newAnalyser.fftSize = 256;
      // Create a new Uint8Array to hold the frequency data
      const newDataArray = new Uint8Array(newAnalyser.frequencyBinCount);
  
      // Create a media stream source from the audio track
      const source = newAudioContext.createMediaStreamSource(new MediaStream([audioTrack.getMediaStreamTrack()]));
      // Connect the source to the analyser
      source.connect(newAnalyser);
  
      // Update state with new audio context, analyser, and data array
      setAudioContext(newAudioContext);
      setAnalyser(newAnalyser);
      setDataArray(newDataArray);
  
      return () => {
        newAudioContext.close();
      };
    }, [audioTrack, isMuted]);
  
    useEffect(() => {
      if (!canvasRef.current || !analyser || !dataArray) return;
  
      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext('2d');
      if (!canvasCtx) return;
  
      const draw = () => {
        if (isMuted) {
          // Clear the canvas if muted
          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }
        animationRef.current = requestAnimationFrame(draw);
        frameCountRef.current = (frameCountRef.current + 1) % 3;
        if (frameCountRef.current !== 0) return;
  
        analyser.getByteFrequencyData(dataArray);
  
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  
        const barWidth = (canvas.width / analyser.frequencyBinCount) * 5;
        let barHeight;
        let x = 0;
  
        // Draw frequency bars
        const numberOfBars = Math.floor(analyser.frequencyBinCount / 10)
        for (let i = 0; i < numberOfBars; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height * 0.5;
  
        //   const hue = ((i / analyser.frequencyBinCount) * 120) + 240;
          canvasCtx.fillStyle = '#00C2FF';
  
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
  
          x += barWidth + 1;
        }
      };
  
      draw();
  
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [analyser, dataArray, isMuted]);
  
    return (
      <canvas ref={canvasRef} className="left-1/2 transform -translate-x-1/2 w-1/4 h-16" />
    );
  };
  