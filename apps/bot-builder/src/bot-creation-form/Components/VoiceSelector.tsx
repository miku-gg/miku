import React, { useRef, useState } from "react";
import { Dropdown } from "@mikugg/ui-kit";
import { voices } from "../data/voices";
import "./VoiceSelector.scss";
import AudioPreview from "./AudioPreview";

interface Voice {
  id: string
  provider: string
  provider_voice_id: string
  provider_emotion?: string
  training_sample?: string
}

export function getVoiceId(voice: {
  provider: string
  provider_voice_id: string
  provider_emotion?: string
  training_sample?: string
}): string {
  return `${voice.provider}.${voice.provider_voice_id}${voice.provider_emotion ? `.${voice.provider_emotion}` : ''}`;
}

const VoiceSelector: React.FC<{voice: Voice, onChange: (voice: Voice) => void}> = ({voice, onChange}) => {
  const [expandedVoiceDropdown, setExpandedVoiceDropdown] = useState(false);

  function handleDropdownChange(
    index: number,
  ): void {
    const selectedVoice = voices[index];
    onChange({
      id: getVoiceId(selectedVoice),
      ...selectedVoice,
    })
  }

  return (
    <div className="VoiceSelector">
      <Dropdown
        expanded={expandedVoiceDropdown}
        items={voices.map(voice => ({ name: voice.label }))}
        onChange={handleDropdownChange}
        onToggle={setExpandedVoiceDropdown}
        selectedIndex={
          voices.findIndex(
            (_voice) => (
              voice.provider === _voice.provider &&
              voice.provider_voice_id === _voice.provider_voice_id &&
              voice.provider_emotion === _voice.provider_emotion
            )
          )
        }
      />
      <AudioPreview src={`/voices/${voice.id}.mp3`} />
    </div>
  );
}

export default VoiceSelector;