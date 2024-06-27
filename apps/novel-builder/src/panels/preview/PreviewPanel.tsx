import { Button, Loader, Modal } from "@mikugg/ui-kit";
import config, { STAGE } from "../../config";
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
          assetsEndpoint:
            STAGE === "development"
              ? "http://localhost:8585/s3/assets"
              : "https://assets.miku.gg",
          cardEndpoint: "http://localhost:8585/s3/bots",
          servicesEndpoint:
            STAGE === "development"
              ? "http://localhost:8484"
              : "https://services.miku.gg",
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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

  const handlExport = async (exportFor: "miku" | "local") => {
    try {
      await downloadNovelState(
        cloneDeep(novel),
        exportFor === "local" ? config.genAssetLink : false,
        (text: string) => {
          dispatch(
            openModal({
              modalType: "loading",
              text,
            })
          );
        },
        exportFor === "local"
      );      
    } catch (e) {
      console.error(e);
      toast.error(`Failed to ${exportFor === "miku" ? "build" : "save"} novel`);
    }
    dispatch(closeModal({ modalType: "loading" }));
    setIsModalOpen(false);
  }

  useEffect(() => {
    if (!loadingIframe) {
      const iframe = iframeRef.current;

      const start = novel.starts[0];

      if (!start) return;

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
        <Modal
          opened={isModalOpen}
          onCloseModal={() => setIsModalOpen(false)}
        >
          <div className="PreviewPanel__modal-content">
            <h2 className="PreviewPanel__modal-title">Build project</h2>
            <ul className="PreviewPanel__options">
              <li className="PreviewPanel__option">
                <p className="PreviewPanel__option-title">Export for Miku.gg</p>
                <p className="PreviewPanel__option-description">Saves your project as a .json file without assets. Ideal for sharing or uploading to Miku.gg.</p>
              </li>
              <li className="PreviewPanel__option">
                <p className="PreviewPanel__option-title">Export for Local Use</p>
                <p className="PreviewPanel__option-description">Saves your project as a .json file with all associated assets included. Perfect for offline use or complete backups.</p>
              </li>
            </ul>
            <div className="PreviewPanel__buttons-group">
              <Button theme="gradient" onClick={() => handlExport("miku")}>
                Export for Miku.gg
              </Button>
              <Button theme="transparent" onClick={() => handlExport("local")}>
                Export for Local Use
              </Button>
            </div>
          </div>
        </Modal>
        <div className="PreviewPanel__build">
          <Button theme="gradient" onClick={() => setIsModalOpen(true)}>
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
