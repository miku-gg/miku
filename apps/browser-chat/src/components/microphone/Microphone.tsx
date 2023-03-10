import { IMediaRecorder, MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';
import React, { useState } from "react";
import botFactory from "../../libs/botFactory";
import { MicrophoneIcon } from '@heroicons/react/20/solid';
import { SmallSpinner } from '../interactive-chat/chat-input-box/ChatInputBox';

connect().then(_connection => register(_connection));
const mediaRecorder: { value: IMediaRecorder | null, stream: MediaStream | null } = {
  value: null,
  stream: null
};
let audio: string = "";

export const Microphone = ({ onInputText, disabled}: {disabled: boolean, onInputText: (text: string) => void}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleStartRecording = async (e: React.MouseEvent) => {
    e.preventDefault();
    const recordedChunks: Blob[] = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });      
      const recorder = new MediaRecorder(stream, {mimeType: 'audio/wav'});
      mediaRecorder.value = recorder;
      mediaRecorder.stream = stream;
      recorder.ondataavailable = (event: BlobEvent) => {
        recordedChunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, {
          type: "audio/wav; codecs=0",
        });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        const bot = botFactory.getInstance();
        if (bot) {
          setLoading(true);
          bot.speechToText(blob).then((text) => {
            onInputText(text || '');
            setLoading(false);
          }).catch(() => setLoading(false));
        }
        reader.onloadend = () => {
          const base64data = reader.result as string;
          audio = base64data;
          new Audio('/recording-end.mp3').play();
          setIsRecording(false);
          mediaRecorder.value = null;
          mediaRecorder.stream?.getTracks().forEach((track) => track.stop());
          mediaRecorder.stream = null;
        };
      };

      recorder.start();
      setIsRecording(true);
      new Audio('/recording-start.mp3').play();
    } catch (error) {
      console.log(error);
    }
  };

  const handleStopRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    mediaRecorder.value?.stop();
    mediaRecorder.stream?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
  };

  const BASE_CLASS = 'text-violet-400 hover:text-violet-300 transition-all disabled:hover:text-violet-400';
  const RECORDING_CLASS = 'text-red-400 hover:text-red-400';
  const LOADING_CLASS = 'w-6 text-gray-400';

  return (
    <button
      className={`${BASE_CLASS} ${isRecording ? RECORDING_CLASS : (loading ? LOADING_CLASS : '') }`}
      disabled={disabled}
      onClick={isRecording ? handleStopRecording : handleStartRecording}>
        {loading ? <SmallSpinner /> : <MicrophoneIcon width={16} />}
    </button>
  );
};
