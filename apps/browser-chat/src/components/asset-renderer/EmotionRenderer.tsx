import { useEffect, useState } from "react";
import './EmotionRenderer.scss'

export default function EmotionRenderer({
    assetUrl,
    className = '',
    upDownAnimation = false,
    assetLinkLoader,
  }: {
    assetUrl: string,
    className?: string,
    upDownAnimation?: boolean,
    assetLinkLoader: (asset: string, format?: string) => string
  }): JSX.Element {
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [blobUrl_LOW, setBlobUrl_LOW] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [hasPlayedAudio, setHasPlayedAudio] = useState<boolean>(false);
  const [fileType, setFileType] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFile() {
      try {
        setLoading(true);
        const response = await fetch(
          assetLinkLoader(assetUrl, '480p')
        );
        if (response.ok) {
          const contentType = response.headers.get("Content-Type");
          const data = await response.blob();
          const newBlobUrl = URL.createObjectURL(data);
          setBlobUrl_LOW(newBlobUrl);
          setBlobUrl('');
          setFileType(contentType);
          setLoading(false);
          setHasPlayedAudio(false);
          const response2 = await fetch(
            assetLinkLoader(assetUrl, '720p')
          );
          if (response2.ok) {
            const data = await response2.blob();
            const newBlobUrl = URL.createObjectURL(data);
            setBlobUrl(newBlobUrl);
          }
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
        src={blobUrl || blobUrl_LOW}
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
        src={blobUrl || blobUrl_LOW}
        alt="character"
        onError={({ currentTarget }) => {
          currentTarget.onerror = null;
          currentTarget.src = "/default_character.png";
        }}
      />
    );
  }
};