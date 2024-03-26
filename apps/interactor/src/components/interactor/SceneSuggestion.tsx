import { GiFallingStar } from 'react-icons/gi'
import './SceneSuggestion.scss'

export default function SceneSuggestion() {
  return (
    <div className="SceneSuggestion">
      <button className="SceneSuggestion__button">
        <div className="SceneSuggestion__text">
          <span>Advance to next scene</span>
        </div>
        <GiFallingStar />
      </button>
    </div>
  )
}
