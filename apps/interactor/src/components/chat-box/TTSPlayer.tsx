import React, { useEffect, useRef } from 'react'
import { useAppSelector } from '../../state/store'
import { selectLastLoadedCharacters } from '../../state/selectors'
import { replaceAll } from '../../utils/replace'
import { MdRecordVoiceOver } from 'react-icons/md'
import { Tooltip } from '@mikugg/ui-kit'
import classNames from 'classnames'
import { Speed } from '../../state/versioning'
import { useAppContext } from '../../App.context'

const TTSPlayer2: React.FC = () => {
  const { servicesEndpoint, isProduction, freeTTS } = useAppContext()
  const voiceId = useAppSelector((state) => state.settings.voice.voiceId)
  const audioRef = useRef<HTMLAudioElement>(null)
  const sourceBufferRef = useRef<SourceBuffer | null>(null)
  const mediaSourceRef = useRef<MediaSource | null>(null)
  const queueRef = useRef<Uint8Array[]>([])
  const fetchControllerRef = useRef<AbortController | null>(null)
  const lastCharacters = useAppSelector(selectLastLoadedCharacters)
  const { disabled } = useAppSelector((state) => state.narration.input)
  const lastCharacterText = lastCharacters[0]?.text || ''
  const autoPlay = useAppSelector((state) => state.settings.voice.autoplay)
  const playSpeed = useAppSelector((state) => state.settings.voice.speed)
  const isFirstMessage = useAppSelector(
    (state) =>
      state.narration.responses[state.narration.currentResponseId]
        ?.parentInteractionId === null
  )
  const characterId = useAppSelector(
    (state) => Object.values(state.novel.characters)[0]?.id || ''
  )
  const isPremium = useAppSelector((state) => state.settings.user.isPremium)
  const nextText =
    (!disabled &&
      !isFirstMessage &&
      (isPremium || freeTTS) &&
      isProduction &&
      lastCharacterText) ||
    ''
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_provider, _voiceId, speakingStyle = 'default'] = voiceId.split('.')

  useEffect(() => {
    if (!window.MediaSource) {
      console.error('MediaSource API is not supported in this browser.')
      return
    }
    if (!nextText) return

    // Function to initialize MediaSource and start fetching audio
    const initializeMediaSource = () => {
      mediaSourceRef.current = new MediaSource()
      const audioUrl = URL.createObjectURL(mediaSourceRef.current)
      mediaSourceRef.current.addEventListener('sourceopen', sourceOpen)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
      }
    }

    // Function to handle the 'sourceopen' event
    async function sourceOpen() {
      try {
        // eslint-disable-next-line
        // @ts-ignore
        sourceBufferRef.current =
          mediaSourceRef.current?.addSourceBuffer('audio/mpeg') // Adjust MIME type as needed
        sourceBufferRef.current?.addEventListener('updateend', processQueue)

        fetchControllerRef.current = new AbortController()
        const { signal } = fetchControllerRef.current

        const response = await fetch(`${servicesEndpoint}/audio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: replaceAll(lastCharacterText, '*', ''),
            voiceId: _voiceId,
            speakingStyle: speakingStyle,
          }),
          signal,
        })
        const reader = response.body?.getReader()
        if (!reader) return

        /* eslint-disable no-constant-condition */
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            mediaSourceRef.current?.endOfStream()
            break
          }
          if (value) {
            queueRef.current.push(value)
            processQueue()
          }
        }
      } catch (error: unknown) {
        console.error(error)
      }
    }

    // Function to process the data queue
    function processQueue() {
      if (
        sourceBufferRef.current &&
        !sourceBufferRef.current.updating &&
        queueRef.current.length
      ) {
        sourceBufferRef.current.appendBuffer(queueRef.current.shift()!)
      }
    }

    // Initialize and start fetching new audio
    initializeMediaSource()

    // Cleanup function
    return () => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort()
      }
      if (mediaSourceRef.current) {
        if (mediaSourceRef.current.readyState === 'open') {
          mediaSourceRef.current.endOfStream()
        }
        URL.revokeObjectURL(audioRef.current?.src || '')
      }
      queueRef.current = []
    }
  }, [_voiceId, _provider, speakingStyle, nextText]) // Add text as a dependency

  if (!isProduction) return null

  return (
    <>
      <audio
        ref={audioRef}
        controls
        style={{ position: 'absolute', display: 'none' }}
        autoPlay={autoPlay}
        src={
          isFirstMessage && isProduction
            ? `https://assets.miku.gg/${characterId}.${_voiceId}.${speakingStyle}.wav`
            : undefined
        }
      >
        Your browser does not support the audio element.
      </audio>
      <button
        className={classNames({
          ResponseBox__voice: true,
          'ResponseBox__voice--disabled':
            !isPremium && !freeTTS && !isFirstMessage,
        })}
        onClick={() => {
          if (audioRef.current) {
            // restart audio
            audioRef.current.currentTime = 0
            switch (playSpeed) {
              case Speed.Slow:
                audioRef.current.playbackRate = 0.75
                break
              case Speed.Normal:
                audioRef.current.playbackRate = 1
                break
              case Speed.Fast:
                audioRef.current.playbackRate = 1.5
                break
              case Speed.Presto:
                audioRef.current.playbackRate = 2
                break
            }
            audioRef.current.play()
          }
        }}
        disabled={!isPremium && !freeTTS && !isFirstMessage}
        data-tooltip-id="smart-tooltip"
        data-tooltip-content={
          !isPremium && !freeTTS && !isFirstMessage
            ? 'This is a premium feature'
            : !isPremium && freeTTS
            ? 'Free for a limited time'
            : ''
        }
      >
        <MdRecordVoiceOver />
        <span>Listen</span>
      </button>
      <Tooltip id="audio-tooltip" place="top" />
    </>
  )
}

export default TTSPlayer2
