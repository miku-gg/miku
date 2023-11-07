import { useEffect, useRef, useState } from "react";
import './EmotionRenderer.scss'

const assets = new Map<string, {
  url: string,
  fileType: string | null
}>();

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
  const [loading, setLoading] = useState<boolean>(true);
  const [currentAsset, setCurrentAsset] = useState<{url: string, fileType: string | null}>({
    url: '',
    fileType: null
  });
  const assetVersion = useRef(0); // To keep track of asset versions


  useEffect(() => {
    const currentVersion = ++assetVersion.current;
    const controller = new AbortController();
    async function fetchAndSetAsset(url: string, quality: '480p' | '720p') {
      const response = await fetch(assetLinkLoader(url, quality));
      if (response.ok && response.status === 200) {
        const contentType = response.headers.get("Content-Type");
        const data = await response.blob();
        const newBlobUrl = URL.createObjectURL(data);
        assets.set(url, {
          fileType: contentType,
          url: newBlobUrl,
        });
        if (currentVersion !== assetVersion.current) {
          return;
        }
        setCurrentAsset({ fileType: contentType, url: newBlobUrl });
      }
    }

    async function fetchAssets() {
      setLoading(true);

      await fetchAndSetAsset(assetUrl, '480p');

      fetchAndSetAsset(assetUrl, '720p').then(() => {
        setLoading(false);
      });
    }

    // Fetch assets only if they haven't been fetched before or if assetUrl changes.
    if (!assets.has(assetUrl)) {
      fetchAssets();
    } else {
      // If we already have the asset, use it and don't show the loading state.
      setCurrentAsset(assets.get(assetUrl) || { url: '', fileType: null });
      setLoading(false);
    }

    return () => {
      controller.abort(); // Cancel the fetch operation if the component unmounts or the assetUrl changes
    };
  }, [assetUrl, assetLinkLoader]);


  const { url: blobUrl, fileType } = currentAsset;

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