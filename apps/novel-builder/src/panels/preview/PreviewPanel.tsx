import { Loader } from "@mikugg/ui-kit";
import config from "../../config";
import { useEffect, useMemo, useRef, useState } from "react";
import base64 from "base-64";
import utf8 from "utf8";
import queryString from "query-string";
import { useAppSelector } from "../../state/store";

export function generateAlphaLink({
  botHash,
  chatId,
}: {
  botHash: string;
  chatId: string;
}): string {
  const searchParams = {
    cardId: botHash,
    narrationId: chatId,
    production: true,
    configuration: base64.encode(
      utf8.encode(
        JSON.stringify({
          assetUploadEndpoint: "http://localhost:8585/s3/asset-upload",
          characterSearchEndpoint: "",
          backgroundSearchEndpoint: "",
          assetsEndpoint: "http://localhost:8585/s3/assets",
          cardEndpoint: "http://localhost:8585/s3/bots",
          servicesEndpoint: "http://localhost:8484",
          freeTTS: false,
          freeSmart: false,
          settings: {
            user: {
              isPremium: false,
            },
          },
        })
      )
    ),
  };

  const searchString = queryString.stringify(searchParams);

  return `${config.previewIframe}/?${searchString}`;
}

export default function PreviewPanel() {
  const [loadingIframe, setLoadingIframe] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const novel = useAppSelector((state) => state.novel);

  const botInteractionUrl = useMemo(
    () =>
      generateAlphaLink({
        botHash: "QmXe2icjuvjQ8F1LskALxQ5ugQKr59eZDvtFhkjvUYN64v.json",
        chatId: "chatId",
      }),
    []
  );

  useEffect(() => {
    if (!loadingIframe) {
      const iframe = iframeRef.current;

      const start = novel.starts[0];

      iframe?.contentWindow?.postMessage(
        {
          type: "NARRATION_DATA",
          payload: {
            version: "v3",
            novel,
            narration: {
              fetching: false,
              currentResponseId: start.id,
              id: "chatId",
              input: {
                text: "",
                suggestions: [],
                disabled: false,
              },
              interactions: {},
              responses: {
                [start.id]: {
                  id: start.id,
                  parentInteractionId: null,
                  selectedCharacterId: start.characters[0].characterId,
                  characters: start.characters,
                  fetching: false,
                  selected: true,
                  suggestedScenes: [],
                  childrenInteractions: [],
                },
              },
            },
          },
        },
        "*"
      );
    }
  }, [loadingIframe, novel]);

  return (
    <div>
      <h1>PreviewPanel</h1>
      {loadingIframe ? <Loader /> : null}
      <div className="ChatPage__interactor-container">
        <iframe
          ref={iframeRef}
          onLoad={() => setLoadingIframe(false)}
          src={botInteractionUrl}
          width="100%"
          height="100%"
          allowTransparency={true}
          frameBorder="0"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-forms allow-downloads"
          allow="fullscreen"
        ></iframe>
      </div>
    </div>
  );
}
