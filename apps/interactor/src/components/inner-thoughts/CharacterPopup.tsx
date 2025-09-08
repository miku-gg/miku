import React from 'react';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { IoChatbubbleEllipsesSharp } from 'react-icons/io5';
import { FaSpinner } from 'react-icons/fa';
import InnerThoughtsBox from './InnerThoughtsBox';
import { useAppContext } from '../../App.context';
import { useAppSelector } from '../../state/store';
import { selectLastLoadedResponse } from '../../state/selectors';
import PromptBuilder from '../../libs/prompts/PromptBuilder';
import { RoleplayInnerThoughtsStrategy } from '../../libs/prompts/strategies/roleplay/RoleplayInnerThoughtsStrategy';
import textCompletion from '../../libs/textCompletion';
import { retrieveModelMetadata } from '../../libs/retrieveMetadata';
import './CharacterPopup.scss';

interface CharacterPopupProps {
  character: {
    id: string;
    name: string;
    description?: string;
    profile_pic: string;
  };
  assetLinkLoader: (asset: string, type: AssetDisplayPrefix) => string;
  isVisible: boolean;
  position: { x: number; y: number };
  innerThoughts?: string[];
}

const CharacterPopup: React.FC<CharacterPopupProps> = ({
  character,
  isVisible,
  innerThoughts = [],
}) => {
  const { servicesEndpoint } = useAppContext();
  const state = useAppSelector((state) => state);
  const lastResponse = useAppSelector(selectLastLoadedResponse);
  
  const [isHovered, setIsHovered] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);
  const [showInnerThoughts, setShowInnerThoughts] = React.useState(false);
  const [isGeneratingThoughts, setIsGeneratingThoughts] = React.useState(false);
  const [generatedThoughts, setGeneratedThoughts] = React.useState<string>('');
  const [_characterPosition, setCharacterPosition] = React.useState({ x: 0, y: 0, width: 0, height: 0 });
  const characterRef = React.useRef<HTMLDivElement>(null);

  // Calculate character position for popup placement
  React.useEffect(() => {
    const updatePosition = () => {
      if (characterRef.current) {
        const rect = characterRef.current.getBoundingClientRect();
        setCharacterPosition({
          x: rect.left, // Cover from left edge
          y: rect.top,  // Cover from top edge
          width: rect.width,  // Full width
          height: rect.height // Full height
        });
      }
    };

    if (isVisible) {
      updatePosition();
      // Update position on window resize
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [isVisible, character.name]);

  const generateInnerThoughts = async () => {
    if (isGeneratingThoughts) return;
    
    console.log('CharacterPopup - generateInnerThoughts started:', {
      character: character.name,
      characterId: character.id,
      lastResponse,
      isGeneratingThoughts
    });
    
    // Check if there's already a response from this character
    // If there's none, we should not generate inner thoughts
    const currentCharacterResponse = lastResponse?.characters.find(char => char.characterId === character.id);
    if (!currentCharacterResponse || !currentCharacterResponse.text) {
      return;
    }
    
    setIsGeneratingThoughts(true);
    
    try {
      const modelMetadata = await retrieveModelMetadata(servicesEndpoint, state.settings.model);
      const promptBuilder = new PromptBuilder<RoleplayInnerThoughtsStrategy>({
        maxNewTokens: 100,
        strategy: new RoleplayInnerThoughtsStrategy(modelMetadata.strategy, state.novel.language || 'en', modelMetadata.has_reasoning),
        truncationLength: modelMetadata.truncation_length - 150,
      });
      
      const prompt = promptBuilder.buildPrompt(state, 30);
      console.log('CharacterPopup - Built prompt:', prompt);
      
      const stream = textCompletion({
        template: prompt.template,
        variables: prompt.variables,
        model: state.settings.model,
        serviceBaseUrl: servicesEndpoint,
        identifier: `${Date.now()}`,
      });

      let response = lastResponse;
      if (!response) {
        // if no last response, abort
        setIsGeneratingThoughts(false);
        return;
      }
      
      // here starts the stream processing
      let hasShownWindow = false;
      
      for await (const result of stream) {
        response = promptBuilder.completeResponse(response, result, state);        
        // Update the generated thoughts as they come in
        const currentCharacter = response?.characters.find(char => char.characterId === character.id);
        if (currentCharacter?.innerThoughts && currentCharacter.innerThoughts.trim()) {
          setGeneratedThoughts(currentCharacter.innerThoughts);
          
          // Show the window only when we have actual content
          if (!hasShownWindow) {
            setShowInnerThoughts(true);
            hasShownWindow = true;
          }
        }
      }
      setIsGeneratingThoughts(false);

    } catch (error) {
      setIsGeneratingThoughts(false);
    }
  };

  return (
    <div
      ref={characterRef}
      className="CharacterPopup"
    >
      {/* Popup covering entire character */}
      <div 
        className="CharacterPopup__container"
        style={{
          opacity: (isHovered || isClicked) ? 1 : 0,
        }}
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        {isGeneratingThoughts ? (
          <FaSpinner 
            className="CharacterPopup__icon CharacterPopup__icon--spinner"
            style={{
              animation: 'spin 1s linear infinite',
            }}
          />
        ) : (
           <IoChatbubbleEllipsesSharp 
             className={`CharacterPopup__icon ${
               !lastResponse?.characters.find(char => char.characterId === character.id)?.text 
                 ? 'CharacterPopup__icon--disabled' 
                 : ''
             }`}
             onClick={generateInnerThoughts}
           />
        )}
      </div>
      
      <InnerThoughtsBox
        isVisible={showInnerThoughts}
        thoughts={generatedThoughts ? [generatedThoughts] : innerThoughts}
        characterName={character.name}
        onClose={() => {
          setShowInnerThoughts(false);
          setIsClicked(false);
          setIsHovered(false);
        }}
      />
    </div>
  );
};

export default CharacterPopup;
