import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { NovelV3 } from '@mikugg/bot-utils'

const objectivesSlice = createSlice({
  name: 'objectives',
  initialState: [] as NovelV3.NovelObjective[],
  reducers: {
    setObjectives: (
      _state,
      action: PayloadAction<NovelV3.NovelObjective[]>
    ) => {
      return action.payload
    },
    addObjective: (state, action: PayloadAction<NovelV3.NovelObjective>) => {
      state.push(action.payload)
    },
    removeObjective: (state, action: PayloadAction<string>) => {
      return state.filter((objective) => objective.id !== action.payload)
    },
  },
})

export const scenesToObjectives = (
  scenes: NovelV3.NovelScene[]
): NovelV3.NovelObjective[] => {
  const result: NovelV3.NovelObjective[] = []
  scenes.forEach((scene) => {
    scene.children.forEach((childId) => {
      const child = scenes.find((scene) => scene.id === childId)
      if (child?.condition) {
        result.push({
          id: `scene_transition_${scene.id}_to_${childId}`,
          name: `Transition to ${child.name}`,
          sceneId: scene.id,
          condition: child.condition,
          action: {
            type: NovelV3.NovelObjectiveActionType.SUGGEST_ADVANCE_SCENE,
            params: {
              sceneId: childId,
            },
          },
        })
      }
    })
  })
  return result
}

export const { setObjectives, addObjective, removeObjective } =
  objectivesSlice.actions

export default objectivesSlice.reducer