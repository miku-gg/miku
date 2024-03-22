import { Button, Loader } from "@mikugg/ui-kit";
import config from "../../config";
import { useEffect, useMemo, useRef, useState } from "react";
import base64 from "base-64";
import utf8 from "utf8";
import queryString from "query-string";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { PiHammerBold } from "react-icons/pi";
import "./PreviewPanel.scss";
import { downloadNovelState } from "../../libs/utils";
import cloneDeep from "lodash.clonedeep";
import { closeModal, openModal } from "../../state/slices/inputSlice";
import { toast } from "react-toastify";

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
              nsfw: 2,
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
  const dispatch = useAppDispatch();

  const botInteractionUrl = useMemo(
    () =>
      generateAlphaLink({
        botHash: "QmXe2icjuvjQ8F1LskALxQ5ugQKr59eZDvtFhkjvUYN64v.json",
        chatId: "chatId",
      }),
    []
  );

  const handleBuild = async () => {
    try {
      await downloadNovelState(
        cloneDeep(novel),
        config.genAssetLink,
        (text: string) => {
          dispatch(
            openModal({
              modalType: "loading",
              text,
            })
          );
        },
        true
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to build novel");
    }
    dispatch(closeModal({ modalType: "loading" }));
  };

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
              responses: novel.starts.reduce((acc, start) => {
                acc[start.id] = {
                  id: start.id,
                  parentInteractionId: null,
                  selectedCharacterId: start.characters[0].characterId,
                  characters: start.characters,
                  fetching: false,
                  selected: true,
                  suggestedScenes: [],
                  childrenInteractions: [],
                };
                return acc;
              }, {} as Record<string, object>),
            },
          },
        },
        "*"
      );
    }
  }, [loadingIframe, novel]);

  return (
    <div className="PreviewPanel">
      <div className="PreviewPanel__header">
        <h1 className="PreviewPanel__title">Preview</h1>
        <div className="PreviewPanel__build">
          <Button theme="gradient" onClick={handleBuild}>
            <PiHammerBold />
            Build
          </Button>
        </div>
      </div>
      {loadingIframe ? <Loader /> : null}
      <div className="PreviewPanel__iframe-container">
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
