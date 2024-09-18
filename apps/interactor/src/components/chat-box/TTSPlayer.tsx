import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../state/store';
import { selectLastLoadedCharacters } from '../../state/selectors';
import { replaceAll } from '../../libs/prompts/strategies/utils';
import { MdRecordVoiceOver } from 'react-icons/md';
import { Loader, Tooltip } from '@mikugg/ui-kit';
import classNames from 'classnames';
import { Speed } from '../../state/versioning';
import { useAppContext } from '../../App.context';
import { trackEvent } from '../../libs/analytics';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';

function isFirefoxOrSafari(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();

  // Check for Firefox
  if (userAgent.indexOf('firefox') > -1) {
    return true;
  }

  // Check for Safari
  // Safari on iOS uses 'safari' in the user agent string
  // Safari on macOS uses 'safari' and doesn't contain 'chrome'
  if (
    (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) ||
    (userAgent.indexOf('iphone') > -1 && userAgent.indexOf('safari') > -1) ||
    (userAgent.indexOf('ipad') > -1 && userAgent.indexOf('safari') > -1)
  ) {
    return true;
  }

  return false;
}

// eslint-disable-next-line
// @ts-ignore
window.currentInference = '';

const setAudioSpeed = (audioRef: React.RefObject<HTMLAudioElement>, playSpeed: Speed) => {
  if (audioRef.current) {
    switch (playSpeed) {
      case Speed.Slow:
        audioRef.current.playbackRate = 0.85;
        break;
      case Speed.Normal:
        audioRef.current.playbackRate = 1.1;
        break;
      case Speed.Fast:
        audioRef.current.playbackRate = 1.35;
        break;
      case Speed.Presto:
        audioRef.current.playbackRate = 1.75;
        break;
    }
  }
};

const TTSPlayer2: React.FC = () => {
  const { servicesEndpoint, isProduction, freeTTS, assetLinkLoader } = useAppContext();
  const voiceId = useAppSelector((state) => state.settings.voice.voiceId);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const queueRef = useRef<Uint8Array[]>([]);
  const fetchControllerRef = useRef<AbortController | null>(null);
  const lastCharacters = useAppSelector(selectLastLoadedCharacters);
  const { disabled } = useAppSelector((state) => state.narration.input);
  const lastCharacter = lastCharacters.find((char) => char.selected);
  const lastCharacterText = lastCharacter?.text || '';
  const autoPlay = useAppSelector((state) => state.settings.voice.autoplay);
  const playSpeed = useAppSelector((state) => state.settings.voice.speed);
  const isFirstMessage = useAppSelector(
    (state) => state.narration.responses[state.narration.currentResponseId]?.parentInteractionId === null,
  );
  const characterId = lastCharacter?.id;
  const isPremium = useAppSelector((state) => state.settings.user.isPremium);
  const [inferencing, setInferencing] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_provider, _voiceId, speakingStyle = 'default'] = voiceId.split('.');

  useEffect(() => {
    if (disabled) {
      audioRef.current?.pause();
    }
  }, [disabled]);

  const inferAudio = useCallback(() => {
    const _inferenceSignature = `${lastCharacterText}.${_voiceId}.${speakingStyle}`;
    if (!window.MediaSource || isFirefoxOrSafari()) {
      (async () => {
        // Full audio file fetch and playback
        try {
          setInferencing(true);
          fetchControllerRef.current = new AbortController();
          const { signal } = fetchControllerRef.current;

          const response = await fetch(`${servicesEndpoint}/audio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: replaceAll(lastCharacterText, '*', ''),
              voiceId: _voiceId,
              speakingStyle: speakingStyle,
            }),
            signal,
            credentials: 'include',
          });

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);

          setInferencing(false);
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            setAudioSpeed(audioRef, playSpeed);
            audioRef.current.play();
          }

          // eslint-disable-next-line
          // @ts-ignore
          window.currentInference = _inferenceSignature;
        } catch (error: unknown) {
          console.error(error);
          setInferencing(false);
        }
      })();
      return;
    }

    // eslint-disable-next-line
    // @ts-ignore
    if (_inferenceSignature === window.currentInference) {
      if (audioRef.current) {
        setAudioSpeed(audioRef, playSpeed);
        audioRef.current.play();
        audioRef.current.currentTime = 0;
        return;
      }
    }

    // Function to initialize MediaSource and start fetching audio
    const initializeMediaSource = () => {
      mediaSourceRef.current = new MediaSource();
      const audioUrl = URL.createObjectURL(mediaSourceRef.current);
      mediaSourceRef.current.addEventListener('sourceopen', sourceOpen);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        setAudioSpeed(audioRef, playSpeed);
      }
    };

    // Function to handle the 'sourceopen' event
    async function sourceOpen() {
      try {
        // eslint-disable-next-line
        // @ts-ignore
        sourceBufferRef.current = mediaSourceRef.current?.addSourceBuffer('audio/mpeg'); // Adjust MIME type as needed
        sourceBufferRef.current?.addEventListener('updateend', processQueue);
        fetchControllerRef.current = new AbortController();
        const { signal } = fetchControllerRef.current;

        setInferencing(true);
        const response = await fetch(`${servicesEndpoint}/audio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: replaceAll(lastCharacterText, '*', ''),
            voiceId: _voiceId,
            speakingStyle: speakingStyle,
          }),
          signal,
          credentials: 'include',
        });
        const reader = response.body?.getReader();
        if (!reader) return;

        let started = false;
        setInferencing(false);
        /* eslint-disable no-constant-condition */
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // eslint-disable-next-line
            // @ts-ignore
            window.currentInference = _inferenceSignature;
            mediaSourceRef.current?.endOfStream();
            break;
          }
          if (value) {
            queueRef.current.push(value);
            processQueue();
            if (!started) {
              started = true;
              audioRef.current?.play();
            }
          }
        }
      } catch (error: unknown) {
        setInferencing(false);
        console.error(error);
      }
    }

    // Function to process the data queue
    function processQueue() {
      if (sourceBufferRef.current && !sourceBufferRef.current.updating && queueRef.current.length) {
        sourceBufferRef.current.appendBuffer(queueRef.current.shift()!);
      }
    }

    // Initialize and start fetching new audio
    initializeMediaSource();

    // Cleanup function
    return () => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
      if (mediaSourceRef.current) {
        if (mediaSourceRef.current.readyState === 'open') {
          mediaSourceRef.current.endOfStream();
        }
        URL.revokeObjectURL(audioRef.current?.src || '');
      }
      queueRef.current = [];
    };
  }, [lastCharacterText, servicesEndpoint, _voiceId, speakingStyle, playSpeed]);

  useEffect(() => {
    if (autoPlay) {
      inferAudio();
    }
  }, [inferAudio, autoPlay]);

  if (!isProduction) return null;

  return (
    <>
      <audio
        ref={audioRef}
        controls
        style={{ position: 'absolute', display: 'none' }}
        autoPlay={autoPlay}
        src={
          isFirstMessage && isProduction
            ? assetLinkLoader(`${characterId}.${_voiceId}.${speakingStyle}.wav`, AssetDisplayPrefix.MUSIC)
            : undefined
        }
      >
        Your browser does not support the audio element.
      </audio>
      <button
        className={classNames({
          ResponseBox__voice: true,
          'ResponseBox__voice--disabled': !inferencing && !isPremium && !freeTTS && !isFirstMessage,
        })}
        onClick={() => {
          trackEvent('voice-gen-click');
          if (isFirstMessage && audioRef.current) {
            setAudioSpeed(audioRef, playSpeed);
            audioRef.current.play();
            audioRef.current.currentTime = 0;
          } else {
            inferAudio();
          }
        }}
        disabled={!inferencing && !isPremium && !freeTTS && !isFirstMessage}
        data-tooltip-id="smart-tooltip"
        data-tooltip-content={
          !isPremium && !freeTTS && !isFirstMessage
            ? 'This is a premium feature'
            : !isPremium && freeTTS
            ? 'Free for a limited time'
            : ''
        }
      >
        {inferencing ? <Loader /> : <MdRecordVoiceOver />}
        <span>Listen</span>
      </button>
      <Tooltip id="audio-tooltip" place="top" />
    </>
  );
};

export default TTSPlayer2;
