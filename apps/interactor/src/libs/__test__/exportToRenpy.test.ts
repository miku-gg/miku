import { getSlicedStrings } from '../exportToRenpy';

describe('exportToRenpy', () => {
  describe('split text', () => {
    it('should split text into lines', () => {
      const text = `*Lost in the woods on a stormy night, you stumble upon an imposing castle. Desperate for shelter, you enter the unlocked door, finding yourself in a grand but empty foyer. The flickering light of your lantern guides you through the eerie halls until you reach a sprawling dining area.*

      *There, at the head of a long table, sits a figure—Lord Valerian Nightshade. His piercing gaze meets yours, and a faint smile plays upon his lips.* "Well, well, what have we here? A lost traveler seeking shelter from the storm? How fortuitous."*
      
      *Despite the unsettling aura that emanates from Lord Valerian, the promise of warmth and safety draws you closer. As you approach, the doors behind you swing shut, sealing you within the mysterious realm of the Nightshade Castle and its enigmatic master.*
      `;
      const result = getSlicedStrings(text);
      expect(result).toEqual([
        '*Lost in the woods on a stormy night, you stumble upon an imposing castle. Desperate for shelter, you enter the unlocked door, finding yourself in',
        'a grand but empty foyer. The flickering light of your lantern guides you through the eerie halls until you reach a sprawling dining area.*',
        '*There, at the head of a long table, sits a figure—Lord Valerian Nightshade. His piercing gaze meets yours, and a faint smile plays upon his lips.*',
        'Well, well, what have we here? A lost traveler seeking shelter from the storm? How fortuitous.',
        'Despite the unsettling aura that emanates from Lord Valerian, the promise of warmth and safety draws you closer. As you approach, the doors behind you swing shut, sealing you within',
        'the mysterious realm of the Nightshade Castle and its enigmatic master.',
      ]);
    });
  });
});
