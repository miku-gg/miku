import { useEffect, useState } from "react";
import MicIcon from "../../assets/icons/microphone.png";

const mediaRecorder: { value: MediaRecorder | null } = {
  value: null,
};
let audio: string = "";

export const Microphone = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleStartRecording = async () => {
    const recordedChunks: Blob[] = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      const recorder = new MediaRecorder(stream);
      mediaRecorder.value = recorder;
      recorder.ondataavailable = (event: BlobEvent) => {
        recordedChunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, {
          type: "audio/ogg; codecs=opus",
        });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          audio = base64data;
          setIsRecording(false);
          mediaRecorder.value = null;
        };
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleStartRecording();
  }, []);

  const handleStopRecording = () => {
    mediaRecorder.value?.stop();
  };

  return (
    <img
      className="p-1 cursor-pointer hover:outline hover:outline-gray-300 hover:rounded-full active:outline-violet-700"
      src={MicIcon}
      onMouseDown={handleStartRecording}
      onMouseUp={handleStopRecording}
      onMouseLeave={handleStopRecording}
    />
  );
};
