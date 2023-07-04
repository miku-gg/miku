import { useEffect, useState } from "react";
import './EmotionRenderer.scss'

const VITE_IMAGES_DIRECTORY_ENDPOINT =
  import.meta.env.VITE_IMAGES_DIRECTORY_ENDPOINT ||
  "http://localhost:8585/image";

export default function EmotionRenderer({
    assetUrl,
    className = '',
    upDownAnimation = false,
  }: {
    assetUrl: string,
    className?: string,
    upDownAnimation?: boolean,
  }): JSX.Element {
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [hasPlayedAudio, setHasPlayedAudio] = useState<boolean>(false);
  const [fileType, setFileType] = useState<string | null>(null);


  useEffect(() => {
    async function fetchFile() {
      try {
        setLoading(true);
        const response = await fetch(
          `${VITE_IMAGES_DIRECTORY_ENDPOINT}/${assetUrl}`
        );
        if (response.ok) {
          const contentType = response.headers.get("Content-Type");
          const data = await response.blob();
          const newBlobUrl = URL.createObjectURL(data);
          setBlobUrl(newBlobUrl);
          setFileType(contentType);
          setLoading(false);
          setHasPlayedAudio(false);
        } else {
          console.error("Error fetching file:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching file:", error);
      }
    }

    fetchFile();
    setLoading(false);
  }, [assetUrl]);

  if (fileType === "video/webm") {
    return (
      <video
        className={`${className} ${
          (!loading && upDownAnimation) ? "fade-in up-and-down" : ""
        }`}
        src={blobUrl}
        loop
        autoPlay
        muted
        onPlay={() => setHasPlayedAudio(true)}
      />
    );
  } else {
    return (
      <img
        className={`${className} ${
          (!loading && upDownAnimation) ? "fade-in up-and-down" : ""
        }`}
        src={blobUrl}
        alt="character"
        onError={({ currentTarget }) => {
          currentTarget.onerror = null;
          currentTarget.src = "/default_character.png";
        }}
      />
    );
  }
};