---
label: Create bots
icon: package
order: 1800
---

### Create a bot config

To create a bot you need to create a JSON file with a valid structure.

```ts
{
    "bot_name": string; // The name of the bot
    "version": string; // The version of the bot
    "subject": string; // The name of the character that interacts with the bot
    "profile_pic": string; // The preview picture of the bot
    "background_pic": string; // The background of the bot chat
    "short_term_memory": {
        "service": 'gpt_short-memory', // The strategy that will be used to store the short term memory, currently "gpt_short-memory" is the only one available.
        "props": {
            "prompt_context": string; // The prompt that describes the bot and the environment
            "prompt_initiator": string; // The prompt that triggers the conversation start
            "language": 'en' | 'es'; // The language of the short term memory,
            "subjects": string[]; // The list of character names that can interact with the bot. `subject` must be included in this list.
            "botSubject": string; // the name of the bot for the chat/prompt completer
      }
    },
    "prompt_completer": {
        "service": 'chatgpt_completer' | 'pygmalion_completer'; // The prompt completer that will be used to generate the bot responses 
        "props": { // depends on the service used
            "model": "text-davinci-003" // The model that will be used to generate the bot responses
        }
    },
    "outputListeners": [ // list of services that will do stuff when the chat response arrives
        {
            "service": 'azure_tts' | 'elevenlabs_tts' | 'novelai_tts', // The voice that will be used to generate the bot responses
            "props": { // depends on the service used
                "voiceId": "en-US-AriaNeural" // The voice that will be used for the bot responses
            }
        },
        {
            "service": "openai_emotion-interpreter",  // For mapping the bot responses to emotion images
            "props": {
                "images": { // Hashes of the emotion images
                    "angry": string;
                    "sad": string;
                    "happy": string;
                    "disgusted": string;
                    "begging": string;
                    "scared": string;
                    "excited": string;
                    "hopeful": string;
                    "longing": string;
                    "proud": string;
                    "neutral": string;
                    "rage": string;
                    "scorn": string;
                    "blushed": string;
                    "pleasure": string;
                    "lustful": string;
                    "shocked": string;
                    "confused": string;
                    "disappointed": string;
                    "embarrassed": string;
                    "guilt": string;
                    "shy": string;
                    "frustrated": string;
                    "annoyed": string;
                    "exhausted": string;
                    "tired": string;
                    "curious": string;
                    "intrigued": string;
                    "amused": string;
                }
            }
        }
    ]
}
```

Here you have two examples of bot configs:

* [Miku: OpenAI + Azure](https://github.com/miku-gg/miku/blob/master/apps/bot-directory/db/bots/QmdDSTD9QV1rTkHRYFtyAJWkYandNXnJeVmrr1xZ8effkS)
* [Elaina: Pygmalion + 11Labs](https://github.com/miku-gg/miku/blob/master/apps/bot-directory/db/bots/QmXThSy6BjidXAeTr3nez9ikXsWh5xZgJZxLbbmcCimdAP)
