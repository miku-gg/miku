import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAppSelector } from '../../state/store'
import { selectLastLoadedCharacters } from '../../state/selectors'
import { replaceAll } from '../../libs/prompts/strategies/utils'
import { MdRecordVoiceOver, MdStop } from 'react-icons/md'
import { Tooltip } from '@mikugg/ui-kit'
import classNames from 'classnames'
import { Speed } from '../../state/versioning'
import { useAppContext } from '../../App.context'

const setAudioSpeed = (
  audioRef: React.RefObject<HTMLAudioElement>,
  playSpeed: Speed
) => {
  if (audioRef.current) {
    switch (playSpeed) {
      case Speed.Slow:
        audioRef.current.playbackRate = 0.85
        break
      case Speed.Normal:
        audioRef.current.playbackRate = 1.1
        break
      case Speed.Fast:
        audioRef.current.playbackRate = 1.35
        break
      case Speed.Presto:
        audioRef.current.playbackRate = 1.75
        break
    }
  }
}

const TTSPlayer2: React.FC = () => {
  const { servicesEndpoint, isProduction, freeTTS } = useAppContext()
  const audioRef = useRef<HTMLAudioElement>(null)
  const sourceBufferRef = useRef<SourceBuffer | null>(null)
  const mediaSourceRef = useRef<MediaSource | null>(null)
  const queueRef = useRef<Uint8Array[]>([])
  const fetchControllerRef = useRef<AbortController | null>(null)
  const lastCharacters = useAppSelector(selectLastLoadedCharacters)
  const { disabled } = useAppSelector((state) => state.narration.input)
  const lastCharacter = lastCharacters.find((char) => char.selected)
  const lastCharacterText = lastCharacter?.text || ''
  const readAsteriks = useAppSelector(
    (state) => state.settings.voice.readAsteriks
  )
  const autoPlay = useAppSelector((state) => state.settings.voice.autoplay)
  const playSpeed = useAppSelector((state) => state.settings.voice.speed)
  const isFirstMessage = useAppSelector(
    (state) =>
      state.narration.responses[state.narration.currentResponseId]
        ?.parentInteractionId === null
  )
  const isPremium = useAppSelector((state) => state.settings.user.isPremium)
  const userName = useAppSelector((state) => state.settings.user.name)
  const botName = useAppSelector(
    (state) => state.novel.characters[lastCharacter!.id]?.name
  )
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (disabled) {
      audioRef.current?.pause()
    }
  }, [disabled])

  const cleanup = () => {
    audioRef.current?.pause()
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
    setPlaying(false)
  }

  const inferAudio = useCallback(() => {
    if (!window.MediaSource) {
      console.error('MediaSource API is not supported in this browser.')
      return
    }

    // Function to initialize MediaSource and start fetching audio
    const initializeMediaSource = () => {
      mediaSourceRef.current = new MediaSource()
      const audioUrl = URL.createObjectURL(mediaSourceRef.current)
      mediaSourceRef.current.addEventListener('sourceopen', sourceOpen)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        setAudioSpeed(audioRef, playSpeed)
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

        let text = lastCharacterText

        text = replaceAll(text, '{{user}}', userName)
        text = replaceAll(text, '{{char}}', botName!)

        if (!readAsteriks) text = text.replace(/\*.*?\*/g, '')

        const response = await fetch(`${servicesEndpoint}/audio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            gpt_cond_latent: lastCharacter?.voices?.gpt_cond_latent,
            speaker_embedding: lastCharacter?.voices?.speaker_embedding,
          }),
          signal,
          credentials: 'include',
        })
        const reader = response.body?.getReader()
        if (!reader) return

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            if (
              sourceBufferRef.current &&
              !sourceBufferRef.current.updating &&
              mediaSourceRef.current
            )
              mediaSourceRef.current.endOfStream()
            break
          }
          if (value) {
            queueRef.current.push(value)
            processQueue()
            if (!playing) {
              setPlaying(true)
              audioRef.current?.play()
            }
          }
        }
      } catch (error: unknown) {
        // if user presses stop button the abort will error
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
    return cleanup
  }, [lastCharacterText, servicesEndpoint, playSpeed, readAsteriks])

  useEffect(() => {
    if (autoPlay) {
      inferAudio()
    }
  }, [inferAudio, autoPlay])

  if (!isProduction) return null

  return (
    <>
      <audio
        ref={audioRef}
        src={undefined}
        autoPlay={autoPlay}
        onEnded={() => setPlaying(false)}
      />
      <button
        className={classNames({
          ResponseBox__voice: true,
          'ResponseBox__voice--disabled':
            !isPremium && !freeTTS && !isFirstMessage,
        })}
        onClick={() => (playing ? cleanup() : inferAudio())}
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
        {playing ? (
          <>
            <MdStop />
            <span>Stop</span>
          </>
        ) : (
          <>
            <MdRecordVoiceOver />
            <span>Listen</span>
          </>
        )}
      </button>
      <Tooltip id="audio-tooltip" place="top" />
    </>
  )
}

export default TTSPlayer2
