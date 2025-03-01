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
import { useI18n } from '../../libs/i18n';

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

const getAudioSpeed = (playSpeed: Speed): number => {
  switch (playSpeed) {
    case Speed.Slow:
      return 0.85;
    case Speed.Normal:
      return 1;
    case Speed.Fast:
      return 1.35;
    case Speed.Presto:
      return 1.75;
    default:
      return 1;
  }
};

const setAudioSpeed = (audioRef: React.RefObject<HTMLAudioElement>, playSpeed: Speed) => {
  if (audioRef.current) {
    audioRef.current.playbackRate = getAudioSpeed(playSpeed);
  }
};

const TTSPlayer2: React.FC = () => {
  const { servicesEndpoint, isProduction, freeTTS, isPublishedDemo } = useAppContext();
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
  const isPremium = useAppSelector((state) => state.settings.user.isPremium);
  const [inferencing, setInferencing] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const { i18n } = useI18n();

  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (disabled) {
      stopAudio();
    }
  }, [disabled, stopAudio]);

  const playAudioViaBuffer = async (audioBuffer: ArrayBuffer, playSpeed: Speed) => {
    if (!audioContextRef.current) {
      // eslint-disable-next-line
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const source = audioContextRef.current.createBufferSource();
    sourceNodeRef.current = source;

    try {
      const decodedBuffer = await audioContextRef.current.decodeAudioData(audioBuffer);
      source.buffer = decodedBuffer;

      // Create a GainNode for volume control
      const gainNode = audioContextRef.current.createGain();
      gainNodeRef.current = gainNode;

      // Connect the source to the gain node and the gain node to the destination
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      // Set playback rate based on playSpeed
      const speed = getAudioSpeed(playSpeed);
      source.playbackRate.value = speed;

      // Enable pitch correction
      source.detune.value = -1200 * Math.log2(speed);

      source.start(0);
    } catch (decodeError) {
      console.error('Error decoding audio data:', decodeError);
    }
  };

  const inferAudio = useCallback(() => {
    const _inferenceSignature = `${lastCharacterText}.${voiceId}`;
    stopAudio();
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
              voiceId,
            }),
            signal,
            credentials: 'include',
          });

          setInferencing(false);
          setAudioSpeed(audioRef, playSpeed);
          playAudioViaBuffer(await response.arrayBuffer(), playSpeed);

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
            voiceId,
          }),
          signal,
          credentials: 'include',
        });
        const reader = response.body?.getReader();
        if (!reader) return;

        let started = false;
        /* eslint-disable no-constant-condition */
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // eslint-disable-next-line
            // @ts-ignore
            window.currentInference = _inferenceSignature;
            mediaSourceRef.current?.endOfStream();
            setInferencing(false);
            break;
          }
          if (value) {
            queueRef.current.push(value);
            processQueue();
            if (!started) {
              started = true;
              audioRef.current?.play();
              setInferencing(false);
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
  }, [lastCharacterText, servicesEndpoint, voiceId, playSpeed]);

  useEffect(() => {
    if (autoPlay) {
      inferAudio();
    }
  }, [inferAudio, autoPlay]);

  if (!isProduction || isPublishedDemo) return null;

  return (
    <>
      <audio
        ref={audioRef}
        controls
        style={{ position: 'absolute', display: 'none' }}
        autoPlay={autoPlay}
        src={undefined}
      >
        Your browser does not support the audio element.
      </audio>
      <button
        className={classNames({
          ResponseBox__voice: true,
          'ResponseBox__voice--disabled': !inferencing && isProduction && !isPremium && !freeTTS,
        })}
        disabled={!inferencing && isProduction && !isPremium && !freeTTS}
        onClick={() => {
          trackEvent('voice-gen-click');
          inferAudio();
        }}
        data-tooltip-id="audio-tooltip"
        data-tooltip-content={
          !isPremium && !freeTTS && isProduction
            ? i18n('this_is_a_premium_feature')
            : !isPremium && freeTTS && isProduction
            ? i18n('free_for_a_limited_time')
            : ''
        }
      >
        {inferencing ? <Loader /> : <MdRecordVoiceOver />}
        <span className="ResponseBox__action-text">{i18n('listen')}</span>
      </button>
      <Tooltip id="audio-tooltip" place="top" />
    </>
  );
};

export default TTSPlayer2;
