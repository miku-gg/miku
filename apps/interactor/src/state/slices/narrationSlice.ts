import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as randomUUID } from 'uuid';
import { NarrationState, NarrationInteraction, NarrationResponse } from '../versioning';
import { toast } from 'react-toastify';
import trim from 'lodash.trim';
import { NarrationSceneSuggestion, NarrationSummarySentence, BattleState } from '../versioning/v3.state';

export type { NarrationState, NarrationInteraction, NarrationResponse } from '../versioning';

const initialState: NarrationState = {
  id: '',
  fetching: true,
  currentResponseId: '',
  input: {
    text: '',
    suggestions: [],
    disabled: false,
    seenCutscene: false,
    cutscenePartIndex: 0,
    cutsceneTextIndex: 0,
    prefillIndicators: [],
  },
  interactions: {},
  responses: {},
  seenHints: [],
  createdIndicatorIds: [],
  hasPlayedGlobalStartCutscene: false,
  hasShownStartSelectionModal: false,
};

const narrationSlice = createSlice({
  name: 'narration',
  initialState,
  reducers: {
    setNarration(_state, action: PayloadAction<NarrationState>) {
      return action.payload;
    },
    setInputText(state, action: PayloadAction<string>) {
      state.input.text = action.payload;
    },
    setSuggestions(state, action: PayloadAction<string[]>) {
      state.input.suggestions = action.payload;
    },
    interactionStart(
      state,
      action: PayloadAction<{
        servicesEndpoint: string;
        apiEndpoint: string;
        text: string;
        sceneId: string;
        isNewScene: boolean;
        characters: string[];
        selectedCharacterId: string;
        emotion?: string;
        afterBattle?: {
          battleId: string;
          isWin: boolean;
        };
      }>,
    ) {
      const { text, sceneId, isNewScene, afterBattle } = action.payload;
      const newInteractionId = randomUUID();
      const response: NarrationResponse = {
        id: randomUUID(),
        selectedCharacterId: action.payload.selectedCharacterId,
        characters: [
          {
            characterId: action.payload.selectedCharacterId,
            text: '',
            emotion: '',
            pose: '',
          },
        ],
        childrenInteractions: [],
        fetching: true,
        parentInteractionId: newInteractionId,
        selected: true,
        suggestedScenes: [],
        indicators: [],
      };
      const interaction: NarrationInteraction = {
        id: newInteractionId,
        parentResponseId: state.currentResponseId,
        query: text,
        sceneId,
        responsesId: [response.id],
        ...(afterBattle && { afterBattle }),
      };
      const currentResponse = state.responses[state.currentResponseId];
      currentResponse?.childrenInteractions.forEach((child) => {
        child.selected = false;
      });
      currentResponse?.childrenInteractions.push({
        interactionId: newInteractionId,
        selected: true,
      });
      state.interactions[newInteractionId] = interaction;
      state.responses[response.id] = response;
      state.currentResponseId = response.id;
      state.input.disabled = true;
      state.input.suggestions = [];
      state.input.seenCutscene = isNewScene ? false : state.input.seenCutscene;
      if (isNewScene) {
        state.input.seenCutscene = false;
        state.input.cutscenePartIndex = 0;
        state.input.cutsceneTextIndex = 0;
      }
    },
    interactionFailure(state, action: PayloadAction<string | undefined>) {
      state.input.disabled = false;
      state.input.seenCutscene = true;
      const response = state.responses[state.currentResponseId];
      if (!response?.fetching) return state;
      toast.error(action.payload || 'Error querying the AI');
      const interaction = state.interactions[response?.parentInteractionId || ''];
      const reponsesId = interaction?.responsesId;
      if (interaction) {
        interaction.responsesId = reponsesId?.filter((responseId) => responseId !== response?.id) || [];

        if (interaction.responsesId.length) {
          const newResponseId = interaction.responsesId[0];
          const newResponse = state.responses[newResponseId];
          if (newResponse) {
            newResponse.selected = true;
            state.currentResponseId = newResponseId;
          }
          delete state.responses[response?.id || ''];
        } else {
          state.currentResponseId = interaction?.parentResponseId || '';
          const currentResponse = state.responses[state.currentResponseId];
          if (currentResponse) {
            currentResponse.childrenInteractions = currentResponse.childrenInteractions.filter(
              (child) => child.interactionId !== response?.parentInteractionId,
            );
            if (currentResponse.childrenInteractions.length) {
              currentResponse.childrenInteractions[0].selected = true;
            }
          }
          delete state.responses[response?.id || ''];
          delete state.interactions[interaction?.id || ''];
        }
      }
    },
    interactionSuccess(
      state,
      action: PayloadAction<{
        nextScene?: string;
        shouldSuggestScenes?: boolean;
        completed: boolean;
        characters: NarrationResponse['characters'];
        summary?: {
          sentences: NarrationSummarySentence[];
        };
        indicators?: NarrationResponse['indicators'];
        battleStartId?: string;
        objectiveCompletedIds?: string[];
      }>,
    ) {
      const { characters, indicators, battleStartId, objectiveCompletedIds } = action.payload;
      const response = state.responses[state.currentResponseId];
      const interaction = state.interactions[response?.parentInteractionId || ''];
      const currentScene = interaction?.sceneId;
      const previousScene =
        state.interactions[state.responses[interaction?.parentResponseId || '']?.parentInteractionId || '']?.sceneId;

      if (response) {
        response.childrenInteractions = [];
        response.characters = characters;
        if (currentScene && previousScene && previousScene === currentScene) {
          response.shouldSuggestScenes = action.payload.shouldSuggestScenes;
        } else {
          response.shouldSuggestScenes = false;
        }
        response.suggestedScenes = [];
        response.fetching = characters.every((char) => !char.text);
        response.selected = true;

        if (action.payload.nextScene) {
          response.nextScene = action.payload.nextScene;
        }
        if (action.payload.summary) {
          response.summary = action.payload.summary;
        }
        if (!response.fetching) {
          state.input.text = '';
        }
        if (indicators) {
          response.indicators = indicators;
        }
        if (battleStartId) {
          response.battleStartId = battleStartId;
        }
        if (objectiveCompletedIds && objectiveCompletedIds.length > 0) {
          response.objectiveCompletedIds = objectiveCompletedIds;
        }
      }
      if (action.payload.completed) {
        state.input.disabled = false;
        state.input.text = '';
        state.input.prefillIndicators = [];
      }
    },
    regenerationStart(
      state,
      action: PayloadAction<{
        apiEndpoint: string;
        servicesEndpoint: string;
        emotion: string;
        characterId: string;
      }>,
    ) {
      const currentInteraction =
        state.interactions[state.responses[state.currentResponseId]?.parentInteractionId || ''];
      if (!currentInteraction) return state;
      const response: NarrationResponse = {
        id: randomUUID(),
        selectedCharacterId: action.payload.characterId,
        characters: [
          {
            characterId: action.payload.characterId,
            emotion: action.payload.emotion,
            text: '',
            pose: '',
          },
        ],
        childrenInteractions: [],
        fetching: true,
        parentInteractionId: currentInteraction.id,
        selected: true,
        suggestedScenes: [],
        indicators: [],
      };
      currentInteraction.responsesId.forEach((responseId) => {
        const response = state.responses[responseId];
        if (response) {
          response.selected = false;
        }
      });
      currentInteraction.responsesId.push(response.id);
      state.responses[response.id] = response;

      state.input.disabled = true;
      state.currentResponseId = response.id;
      state.input.suggestions = [];
    },
    continueResponse(
      state,
      // eslint-disable-next-line
      _action: PayloadAction<{
        apiEndpoint: string;
        servicesEndpoint: string;
      }>,
    ) {
      const response = state.responses[state.currentResponseId];
      const characterResponses = response?.characters || [];
      const lastResponse = characterResponses.length ? characterResponses[characterResponses.length - 1] : null;
      if (!lastResponse) return state;

      const continuationTokens = ['\n"', '\n*', '\n"{{user}},', `\n*{{${lastResponse.characterId}}}`];
      const endingTokens = ['\n', '*', '"', '.', '?', '!'];
      if (endingTokens.some((token) => lastResponse.text.endsWith(token))) {
        lastResponse.text =
          trim(lastResponse.text) + continuationTokens[Math.floor(Math.random() * continuationTokens.length)];
      }
      state.input.disabled = false;
    },
    characterResponseStart(
      state,
      action: PayloadAction<{
        apiEndpoint: string;
        servicesEndpoint: string;
        characterId: string;
      }>,
    ) {
      const { characterId } = action.payload;
      const response = state.responses[state.currentResponseId];
      if (!response) return state;
      const index = response.characters.findIndex((char) => char.characterId === characterId);
      const characters = response.characters.slice(0, index !== -1 ? index : response.characters.length);
      characters.push({
        characterId,
        text: '',
        emotion: '',
        pose: '',
      });
      response.characters = characters;
      response.selectedCharacterId = characterId;
      response.fetching = true;
      state.input.disabled = true;
      state.input.suggestions = [];
    },
    swipeResponse(state, action: PayloadAction<string>) {
      const response = state.responses[action.payload];
      if (response) {
        const interaction = state.interactions[response.parentInteractionId || ''];
        if (interaction) {
          interaction.responsesId.forEach((responseId) => {
            const response = state.responses[responseId];
            if (response) {
              response.selected = false;
            }
          });
        }
        response.selected = true;
        state.currentResponseId = response.id;
        state.input.suggestions = [];
      }
    },
    updateResponse(
      state,
      action: PayloadAction<{
        id: string;
        text: string;
        characterId: string;
        emotion: string;
      }>,
    ) {
      const { id, text, characterId, emotion } = action.payload;
      const response = state.responses[id];
      const charResponse = response?.characters.find((char) => char.characterId === characterId);
      if (charResponse) {
        charResponse.emotion = emotion;
        charResponse.text = text;
      }
    },
    deleteNode(state, action: PayloadAction<string>) {
      const _deleteNode = (id: string) => {
        const response = state.responses[id];
        if (response) {
          response.childrenInteractions.forEach((child) => {
            _deleteNode(child.interactionId);
          });

          delete state.responses[id];
        }
        const interaction = state.interactions[id];
        if (interaction) {
          interaction.responsesId.forEach((responseId) => {
            _deleteNode(responseId);
          });
          delete state.interactions[id];
        }
      };

      const interaction = state.interactions[action.payload];

      if (interaction?.parentResponseId) {
        const parentResponse = state.responses[interaction.parentResponseId];
        if (parentResponse) {
          parentResponse.childrenInteractions = parentResponse.childrenInteractions.filter(
            (child) => child.interactionId !== interaction.id,
          );
        }
      }

      const response = state.responses[action.payload];
      if (response) {
        const parentInteractionId = response.parentInteractionId;
        if (parentInteractionId) {
          const parentInteraction = state.interactions[parentInteractionId];
          if (parentInteraction) {
            parentInteraction.responsesId = parentInteraction.responsesId.filter(
              (responseId) => responseId !== response.id,
            );
          }
        }
      }
      _deleteNode(action.payload);
    },
    updateInteraction(
      state,
      action: PayloadAction<{
        id: string;
        text: string;
      }>,
    ) {
      const { id, text } = action.payload;
      const interaction = state.interactions[id];
      if (interaction) {
        interaction.query = text;
      }
    },
    selectCharacterOfResponse: (
      state,
      action: PayloadAction<{
        characterId: string;
        responseId: string;
      }>,
    ) => {
      const { characterId, responseId } = action.payload;
      const response = state.responses[responseId];
      if (response) {
        response.selectedCharacterId = characterId;
      }
    },
    sceneSuggestionsStart: (
      state,
      // eslint-disable-next-line
      _action: PayloadAction<{
        servicesEndpoint: string;
        singleScenePrompt?: string;
      }>,
    ) => {
      const response = state.responses[state.currentResponseId];
      if (response) {
        response.fetchingSuggestions = true;
      }
    },
    sceneSuggestionsUpdate: (
      state,
      action: PayloadAction<{
        suggestions: NarrationSceneSuggestion[];
        responseId: string;
      }>,
    ) => {
      const response = state.responses[action.payload.responseId];
      if (response) {
        response.suggestedScenes = action.payload.suggestions;
      }
    },
    sceneSuggestionsEnd: (
      state,
      action: PayloadAction<{
        suggestions: NarrationSceneSuggestion[];
        responseId: string;
      }>,
    ) => {
      const response = state.responses[action.payload.responseId];
      if (response) {
        response.fetchingSuggestions = false;
        response.suggestedScenes = action.payload.suggestions;
      }
    },
    setNextSceneToCurrentResponse(state, action: PayloadAction<string>) {
      const response = state.responses[state.currentResponseId];
      if (response) {
        response.nextScene = action.payload;
      }
    },
    setSceneCreationSuggestionToCurrentResponse(state) {
      const response = state.responses[state.currentResponseId];
      if (response) {
        response.shouldSuggestScenes = true;
      }
    },
    markHintSeen(state, action: PayloadAction<string>) {
      if (state.seenHints) {
        state.seenHints.push(action.payload);
      } else {
        state.seenHints = [action.payload];
      }
    },
    updateSummarySentence(
      state,
      action: PayloadAction<{
        responseId: string;
        index: number;
        sentence: string;
        importance: number;
      }>,
    ) {
      const { responseId, index, sentence, importance } = action.payload;
      const response = state.responses[responseId];
      if (response && response.summary) {
        response.summary.sentences[index] = { sentence, importance };
      }
    },
    addSummary: (
      state,
      action: PayloadAction<{
        responseId: string;
        summary: {
          sentences: NarrationSummarySentence[];
        };
      }>,
    ) => {
      const { responseId, summary } = action.payload;
      const response = state.responses[responseId];
      if (response) {
        response.summary = summary;
      }
    },
    deleteSummarySentence(
      state,
      action: PayloadAction<{
        responseId: string;
        index: number;
      }>,
    ) {
      const { responseId, index } = action.payload;
      const response = state.responses[responseId];
      if (response && response.summary) {
        response.summary.sentences.splice(index, 1);
      }
    },
    markCurrentCutsceneAsSeen(state) {
      state.input.seenCutscene = true;
      state.input.cutscenePartIndex = 0;
      state.input.cutsceneTextIndex = 0;
    },
    resetCutsceneIndices(state) {
      state.input.cutscenePartIndex = 0;
      state.input.cutsceneTextIndex = 0;
    },
    setCutscenePartIndex(state, action: PayloadAction<number>) {
      state.input.cutscenePartIndex = action.payload;
    },
    setCutsceneTextIndex(state, action: PayloadAction<number>) {
      state.input.cutsceneTextIndex = action.payload;
    },
    setPrefillIndicators(state, action: PayloadAction<{ id: string; value: string | number }[]>) {
      state.input.prefillIndicators = action.payload;
    },
    clearPrefillIndicators(state) {
      state.input.prefillIndicators = [];
    },
    addCreatedIndicatorId: (state, action: PayloadAction<string>) => {
      if (state.createdIndicatorIds) {
        state.createdIndicatorIds.push(action.payload);
      } else {
        state.createdIndicatorIds = [action.payload];
      }
    },
    removeCreatedIndicatorId: (state, action: PayloadAction<string>) => {
      if (state.createdIndicatorIds) {
        state.createdIndicatorIds = state.createdIndicatorIds.filter((id) => id !== action.payload);
      }
    },
    setHasPlayedGlobalStartCutscene(state, action: PayloadAction<boolean>) {
      state.hasPlayedGlobalStartCutscene = action.payload;
      state.input.cutscenePartIndex = 0;
      state.input.cutsceneTextIndex = 0;
    },
    setHasShownStartSelectionModal(state, action: PayloadAction<boolean>) {
      state.hasShownStartSelectionModal = action.payload;
    },
    setCurrentBattle(state, action: PayloadAction<{ state: BattleState; isActive: boolean }>) {
      state.currentBattle = action.payload;
    },
    activateBattle(state) {
      if (state.currentBattle) {
        state.currentBattle.isActive = true;
        state.input.cutscenePartIndex = 0;
        state.input.cutsceneTextIndex = 0;
      }
    },
    startBattle(state) {
      if (state.currentBattle) {
        state.currentBattle.state.status = 'active';
      }
      state.input.cutscenePartIndex = 0;
      state.input.cutsceneTextIndex = 0;
    },
    clearCurrentBattle(state) {
      delete state.currentBattle;
    },
    // Adjust health (positive to heal, negative to damage) and check win/lose
    addHealth(state, action: PayloadAction<{ targetId: string; amount: number; maxValue: number; isEnemy: boolean }>) {
      const cb = state.currentBattle;
      if (!cb) return;
      const { targetId, amount, maxValue, isEnemy } = action.payload;
      if (isEnemy) {
        const enemy = cb.state.activeEnemies.find((e) => e.enemyId === targetId);
        if (enemy) {
          enemy.currentHealth = Math.max(0, Math.min(enemy.currentHealth + amount, maxValue));
        }
        // victory if all enemies are down
        if (cb.state.activeEnemies.every((e) => e.currentHealth <= 0)) {
          cb.state.status = 'victory';
        }
      } else {
        const hero = cb.state.activeHeroes.find((h) => h.characterId === targetId);
        if (hero) {
          hero.currentHealth = Math.max(0, Math.min(hero.currentHealth + amount, maxValue));
        }
        // defeat if all heroes are down
        if (cb.state.activeHeroes.every((h) => h.currentHealth <= 0)) {
          cb.state.status = 'defeat';
        }
      }
    },
    // Adjust mana (positive to regain, negative to spend)
    addMana(state, action: PayloadAction<{ targetId: string; amount: number; maxValue: number; isEnemy: boolean }>) {
      const cb = state.currentBattle;
      if (!cb) return;
      const { targetId, amount, maxValue, isEnemy } = action.payload;
      if (isEnemy) {
        const enemy = cb.state.activeEnemies.find((e) => e.enemyId === targetId);
        if (enemy) {
          enemy.currentMana = Math.max(0, Math.min(enemy.currentMana + amount, maxValue));
        }
      } else {
        const hero = cb.state.activeHeroes.find((h) => h.characterId === targetId);
        if (hero) {
          hero.currentMana = Math.max(0, Math.min(hero.currentMana + amount, maxValue));
        }
      }
    },
    // Log a battle action
    addBattleLog(
      state,
      action: PayloadAction<{
        turn: number;
        actorId: string;
        actionType: string;
        targets: string[];
        result: string;
        actorType: 'hero' | 'enemy';
        targetType: 'hero' | 'enemy';
      }>,
    ) {
      const cb = state.currentBattle;
      if (!cb) return;
      cb.state.battleLog.push(action.payload);
    },
    // Advance to next turn
    moveNextTurn(state) {
      const cb = state.currentBattle;
      if (!cb) return;
      cb.state.turn += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase('global/replaceState', (_state, action) => {
      // eslint-disable-next-line
      // @ts-ignore
      return action.payload.narration;
    });
  },
});

export const {
  setNarration,
  setInputText,
  setSuggestions,
  interactionFailure,
  interactionStart,
  interactionSuccess,
  regenerationStart,
  continueResponse,
  swipeResponse,
  updateResponse,
  deleteNode,
  updateInteraction,
  selectCharacterOfResponse,
  characterResponseStart,
  sceneSuggestionsStart,
  sceneSuggestionsUpdate,
  sceneSuggestionsEnd,
  setNextSceneToCurrentResponse,
  markHintSeen,
  setSceneCreationSuggestionToCurrentResponse,
  updateSummarySentence,
  addSummary,
  deleteSummarySentence,
  markCurrentCutsceneAsSeen,
  resetCutsceneIndices,
  setCutscenePartIndex,
  setCutsceneTextIndex,
  setPrefillIndicators,
  clearPrefillIndicators,
  addCreatedIndicatorId,
  removeCreatedIndicatorId,
  setHasPlayedGlobalStartCutscene,
  setHasShownStartSelectionModal,
  setCurrentBattle,
  activateBattle,
  startBattle,
  clearCurrentBattle,
  addHealth,
  addMana,
  addBattleLog,
  moveNextTurn,
} = narrationSlice.actions;

export default narrationSlice.reducer;
