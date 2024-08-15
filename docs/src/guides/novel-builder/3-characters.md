---
label: Character Creation
icon: accessibility
order: 98
---

# Character Creation

Characters are the heart of your visual novel in the Miku.gg Novel Builder. They bring your story to life and interact with the player. Creating well-defined characters is crucial for an engaging and immersive experience. This guide will walk you through the process of creating a character in the Novel Builder.

### Creating a Character

To create a character, you'll need to provide various details about their personality, appearance, and background. The Novel Builder offers tools to help you create rich, dynamic characters that can interact realistically with players.

[!embed Character creation](/assets/novel-builder/tutorial_3.mp4)

First, click on the **Assets** tab, click on **Create** in the _Characters_ section and enter the basic information.

- **Character Name**: Enter the name of the character.
- **Character Version**: (Legacy field, can be filled with any value).
- **Author**: (Legacy field, enter same as the novel details).
- **Short Description**: Provide a brief description of the character.
- **Tags**: Add relevant tags for the character. This are meant for organization purposes.
- **Avatar**: Upload a 256x256 JPEG image for the character's avatar.

### Character Description

Keep the description concise but informative. Focus on key personality traits and essential background information.

- Provide a detailed description of the character, including personality traits and other relevant information.
- Do not repeat information or provide too much detail
- Keep it **under 300 tokens** to save memory.

!!!success Generate description with AI
If you're unsure about the character's description, you can use the AI to generate a detailed description based on the character's traits and background. Just click on the **Generate** button and it will use the short description to create a detailed one.
!!!

**Example:**

```
Hikari's Description: "Bubbly and radiant, Hikari burst into every room like sunshine on a cloudy day"
Hikari's Personality: [cheery, optimistic, friendly, outgoing, energetic, lively, playful, bubbly, charming, enthusiastic, welcoming, obsessive]
Hikari's Body: [bright smile, green eyes, curly brown hair, fluffly cat ears, slender figure, bright blue uniform, high heels, warm touch, infectious laughter"]
Hikari uses "nya" and cat-like talking
```

[!embed Description and Reference Conversations](/assets/novel-builder/tutorial_4.mp4)

### Reference Conversations

Reference conversations help the AI understand how the character should respond in different situations. Use these to define the character’s speech patterns and personality, but also add extra information about the character.

- Add example conversations in a question-answer format to define the character's response style.
- Use asterisks (*) for descriptions (e.g., *she smirks and says\*).
- Use quotes for the character's spoken text.
- Keep it **under 300 tokens** to save memory.

!!!success Use AI for reference conversations
You can use the AI to generate reference conversations based on the character's complete description. Click on the **Generate** button to create example conversations for the character.
!!!

**Example:**

```
<START>
Anon: Why the heck are you so cheerful all the time?
Hikari: *Hikari giggles, her fluffy cat ears twitching with amusement.* "Nya, nya! Being happy is just so much fun! It's like chasing the biggest, shiniest ball of yarn ever! Nya!" *She bounces on her heels, her curly brown hair bobbing with each movement.* "Plus, making others smile is the best feeling in the world! It's like giving them a big, warm hug with my paws! Nya-ha-ha!"
Anon: How would you handle a difficult situation?
Hikari: *Hikari's green eyes widen, her head tilting to the side as she considers the question. She purses her lips before responding with a cheerful grin.* "Nya, tough times are like a scratching post that's just too tall to climb! It can be super frustrating, but I just keep pawing at it until I find a way up!" *She mimics a cat scratching motion with her hands, her enthusiasm evident in every gesture.* "Sometimes, all you need is a friend to lend a helping paw or to make you laugh with a silly cat joke. Nya, I might not have all the answers, but I'll always be here to play and explore until we find a solution together! Nya!" *Hikari's smile is as bright as ever, her optimism unwavering as she radiates a childlike innocence and charm.*
```

!!!danger Keep it under 600 tokens
Ensure that both complete description and reference conversations are concise and under 300 tokens to avoid overloading the AI's memory. This helps in maintaining the AI's efficiency and generating accurate responses.
!!!

### Outfits

[!embed Oufit upload](/assets/novel-builder/tutorial_5.mp4)

5. **Outfits**:
   Oufits are a great way to add variety to your character's appearance. You can create different outfits for different scenes or moods.

Each outfits requires a description and an emotion set of images. You can then select which outfit to use in each scene.

### Emotion Sets

6. **Emotion Sets**:
   For each outfit you need to define and upload the character images, you have several options:

- **Single Emotion**: Upload a single image for the character if only one image is available.
- **Base Emotions** (SUGGESTED): Upload 29 PNG images for the standard set of character emotions.
- **Tiny Emotions**: Upload 9 PNG images for a smaller set of character emotions.
- **Lewd Emotions**: Upload 16 PNG images for a set of lewd character emotions (nsfw).

!!!warning Use the base emotions set
Using the base emotions set (29 images) is recommended for consistency across different scenarios. If not available, you can upload a single image or use the Tiny Emotions set.
!!!

### Emotion Pack Generator

If you have character images but not emotions, you can generate them in the [Emotion pack generator](https://miku.gg/imggen) and upload them.
