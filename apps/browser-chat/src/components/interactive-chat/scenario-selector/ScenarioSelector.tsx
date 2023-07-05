import { useState } from 'react';
import backgroundIcon from "../../../assets/icons/background.png";
import './ScenarioSelector.css';
import { useBot } from '../../../libs/botLoader';
import EmotionRenderer from '../../asset-renderer/EmotionRenderer';


const VITE_IMAGES_DIRECTORY_ENDPOINT =
  import.meta.env.VITE_IMAGES_DIRECTORY_ENDPOINT ||
  "http://localhost:8585/image";

interface ScenarioSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function ScenarioSelector({ value, onChange}: ScenarioSelectorProps): JSX.Element | null {
  const { card } = useBot();
  const [expanded, setExpended] = useState<boolean>(false);

  if (!card) return null;
  const currentScenario = card.data.extensions.mikugg.scenarios.find(scenario => scenario.id === value);
  const childrenScenarios = card.data.extensions.mikugg.scenarios.filter(
    scenario => currentScenario?.children_scenarios.length === 0 || currentScenario?.children_scenarios.includes(scenario.id)
  ).map(scenario => {
    try {
      return {
        ...scenario,
        background: card.data.extensions.mikugg.backgrounds.find(background => background.id === scenario.background)?.source || '',
        emotionImg: card.data.extensions.mikugg.emotion_groups.find(emotion_group => emotion_group.id === scenario.emotion_group)?.emotions[0]?.source[0],
      };
    } catch (e) {
      console.error(e);
      return {
        ...scenario,
        background: '',
        emotionImg: ''
      }
    }
  }).filter(_scenario => _scenario.background && _scenario.emotionImg);
  const handleItemClick = (scenarioId: string) => {
    setExpended(false);
    onChange(scenarioId);
  }

  if (!childrenScenarios.length) return null;
  return (
    <div className={`ScenarioSelector ${expanded ? 'ScenarioSelector--expanded' : ''}`} onClick={setExpended.bind(null, !expanded)}>
      <button className="ScenarioSelector__trigger">
        <img
          src={backgroundIcon} />
      </button>
      <div className="ScenarioSelector__list-container" onClick={e => e.stopPropagation()}>
        <div className="ScenarioSelector__list">
          {childrenScenarios.map((_scenario, index) => {
            return (
              <button className="ScenarioSelector__item" key={`scenario-selector-${_scenario.id}-${index}`} onClick={handleItemClick.bind(null, _scenario.id)}>
                <div className="ScenarioSelector__item-background" style={{ backgroundImage: `url(${VITE_IMAGES_DIRECTORY_ENDPOINT}/${_scenario.background})`}}/>
                <EmotionRenderer
                  className="ScenarioSelector__item-emotion"
                  assetUrl={_scenario.emotionImg || ''}
                />
                <div className="ScenarioSelector__item-text">
                  {_scenario.trigger_action}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}