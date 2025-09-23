---
label: Add New Model Support
icon: plus-circle
order: 1800
---

# Adding New Model Support to MikuGG

This guide covers how to add support for a new language model to the MikuGG platform. This involves configuration across multiple components: tokenizers, instruction templates, presets, and integration with the bot directory.

## Overview

Adding a new model requires changes in four main areas:
1. **Tokenizer Configuration** - Handle tokenization for the model
2. **Instruction Template (Strategy)** - Define how prompts are formatted 
3. **Preset Configuration** - Set optimal generation parameters
4. **Integration** - Make the model available in services and UI

## Step 1: Add Tokenizer Support

### 1.1 Add Tokenizer Type

Edit `apps/services/src/services/text/lib/tokenize.mts`:

```typescript
export enum TokenizerType {
  // ... existing tokenizers ...
  YOUR_MODEL = 'your-model',
}
```

### 1.2 Add Tokenizer Files

**Option A: Use existing tokenizer files**
1. Create directory: `apps/interactor/public/tokenizers/YOUR_MODEL/`
2. Download tokenizer files from the model's Hugging Face repo:
   ```bash
   curl -L "https://huggingface.co/your-org/your-model/resolve/main/tokenizer.json" \
     -o "apps/interactor/public/tokenizers/YOUR_MODEL/tokenizer.json"
   curl -L "https://huggingface.co/your-org/your-model/resolve/main/tokenizer_config.json" \
     -o "apps/interactor/public/tokenizers/YOUR_MODEL/tokenizer_config.json"
   ```

**Option B: Precomputed token arrays (like NemoTokenizer)**
For models requiring specific logit_bias handling, create a custom tokenizer class:

```typescript
export class YourModelTokenizer extends Guidance.Tokenizer.AbstractTokenizer {
  private cache: Map<string, number[]> = new Map([
    [' Yes', [1, 1234]], // Token IDs for common responses
    [' No', [1, 5678]],
    // Add more precomputed mappings
  ]);
  
  public name: string = 'your-model';
  
  override encodeString(str: string): number[] {
    return [...(this.cache.get(str) || [])];
  }
  
  override decodeString(arr: number[]): string {
    const arrString = arr.join(',');
    return this.cache2.get(arrString) || '';
  }
  
  override getEOS(): string {
    return '</s>'; // Your model's EOS token
  }
}
```

### 1.3 Add Tokenizer Loading

Add your tokenizer case in the `loadTokenizer` function:

```typescript
export async function loadTokenizer(tokenizerType: TokenizerType): Promise<void> {
  let tokenizer: Guidance.Tokenizer.AbstractTokenizer;
  switch (tokenizerType) {
    // ... existing cases ...
    case TokenizerType.YOUR_MODEL:
      tokenizer = new LenMLTokenizer(`${FRONTEND_TOKENIZER_DB_URL}/YOUR_MODEL`);
      // OR for custom tokenizer:
      // tokenizer = new YourModelTokenizer();
      break;
    // ...
  }
}
```

## Step 2: Add Instruction Template (Strategy)

### 2.1 Add Template Slug

Edit `apps/interactor/src/libs/prompts/strategies/instructTemplates.ts`:

```typescript
export const instructTemplateSlugs = [
  // ... existing templates ...
  'your-model',
] as const;
```

### 2.2 Define Template Format

Add your template to the templates Map:

```typescript
[
  'your-model',
  {
    BOS: '<s>',                    // Beginning of sequence
    SYSTEM_START: '<|system|>',   // System message start
    SYSTEM_END: '<|/system|>',    // System message end  
    INPUT_START: '<|user|>',      // User message start
    INPUT_END: '<|/user|>',       // User message end
    OUTPUT_START: '<|assistant|>', // Assistant response start
    OUTPUT_END: '<|/assistant|>', // Assistant response end
    EOS: '</s>',                  // End of sequence
    STOPS: ['<|user|>', '<|assistant|>', '<|system|>', '</s>'], // Stop tokens
  },
],
```

### 2.3 Add Strategy Enum

Edit `apps/services/src/services/text/data/rpModelTypes.mts`:

```typescript
export enum RPModelStrategy {
  // ... existing strategies ...
  YOUR_MODEL = 'your-model',
}
```

## Step 3: Add Preset Configuration  

### 3.1 Add Preset Type

In `apps/services/src/services/text/data/rpModelTypes.mts`:

```typescript
export enum PresetType {
  // ... existing presets ...
  YOUR_MODEL_PRESET = 'YOUR_MODEL_PRESET',
}
```

### 3.2 Configure Generation Parameters

Edit `apps/services/src/services/text/data/presets.mts`:

```typescript
export const presets = new Map<PresetType, OpenAIAphroditeConfig>([
  // ... existing presets ...
  [
    PresetType.YOUR_MODEL_PRESET,
    {
      n: 1,
      best_of: 1,
      presence_penalty: 0.0,
      frequency_penalty: 0.0,
      repetition_penalty: 1.1,      // Adjust for your model
      temperature: 0.8,             // Creativity level
      min_p: 0.1,                   // Minimum probability threshold
      top_p: 0.9,                   // Nucleus sampling
      top_k: 50,                    // Top-k sampling
      top_a: 0,
      tfs: 1,
      eta_cutoff: 0,
      epsilon_cutoff: 0,
      typical_p: 1,
      mirostat_mode: 0,
      mirostat_tau: 5.0,
      mirostat_eta: 0.1,
      use_beam_search: false,
      length_penalty: 1.0,
      early_stopping: false,
      stop: ['</s>', '<|user|>', '<|assistant|>'], // Model-specific stops
      ignore_eos: false,
      skip_special_tokens: true,
      spaces_between_special_tokens: true,
    },
  ],
]);
```

## Step 4: Update Model Types

### 4.1 Add Tokenizer to Enum

In `apps/services/src/services/text/data/rpModelTypes.mts`:

```typescript
export enum RPModelTokenizers {
  // ... existing tokenizers ...
  YOUR_MODEL = 'your-model',
}
```

## Step 5: Integration with Services

### 5.1 Backend Configuration

The bot-directory reads from `apps/services/backend_config.json`. Users can configure:
- `apiUrl`: Your model's endpoint
- `apiKey`: API key if required
- `model`: Model name
- `strategy`: Instruction template to use
- `tokenizer`: Tokenizer type
- `truncation_length`: Context window size
- `max_new_tokens`: Maximum response length

### 5.2 Model Settings Configuration

Configure your model in the services settings (usually via environment or config file):

```json
{
  "rp_models": [
    {
      "id": "YOUR_MODEL_ID",
      "name": "Your Model Name",
      "description": "Description of your model",
      "new_tokens": 512,
      "truncation_length": 4096,
      "preset": "YOUR_MODEL_PRESET",
      "strategy": "your-model",
      "tokenizer": "your-model", 
      "permission": "free",
      "model_id_for_select": null,
      "cost": 0,
      "endpoint": {
        "url": "http://localhost:8000/v1",
        "api_key": "your-api-key",
        "model": "your-model-name"
      },
      "has_reasoning": false
    }
  ]
}
```

## Step 6: Testing

### 6.1 Test Tokenizer Loading

```typescript
// Test in apps/services
import { loadTokenizer, TokenizerType } from './src/services/text/lib/tokenize.mts';

try {
  await loadTokenizer(TokenizerType.YOUR_MODEL);
  console.log('✅ Tokenizer loaded successfully!');
} catch (error) {
  console.error('❌ Error loading tokenizer:', error);
}
```

### 6.2 Test Model Integration

1. Start your local LLM server (Aphrodite, TabbyAPI, etc.)
2. Configure the model in bot-directory settings
3. Test chat interactions in the interactor
4. Verify proper tokenization and response formatting

## Example: Adding GPT-OSS Support

Here's how GPT-OSS support was added:

```typescript
// 1. Tokenizer
export enum TokenizerType {
  GPT_OSS = 'gpt-oss',
}

// 2. Strategy  
export enum RPModelStrategy {
  HARMONY = 'harmony',
}

// 3. Template
[
  'harmony',
  {
    BOS: '',
    SYSTEM_START: '<|start|>system<|message|>',
    SYSTEM_END: '<|end|>\n',
    INPUT_START: '<|start|>user<|message|>',
    INPUT_END: '<|end|>\n',
    OUTPUT_START: '<|start|>assistant<|channel|>analysis<|message|>',
    OUTPUT_END: '<|end|>\n<|start|>assistant<|channel|>final<|message|>',
    EOS: '<|return|>',
    STOPS: ['<|start|>', '<|end|>', '<|message|>', '<|channel|>', '<|return|>'],
  },
],

// 4. Files downloaded from huggingface.co/openai/gpt-oss-20b
```

## Troubleshooting

### Common Issues

1. **Tokenizer loading fails**: Check file paths and ensure tokenizer files are in the correct directory
2. **Generation stops early**: Adjust stop tokens in your preset configuration
3. **Poor quality responses**: Tune generation parameters (temperature, top_p, repetition_penalty)
4. **Special tokens not handled**: Verify special tokens are defined in tokenizer_config.json

### Debug Steps

1. Check browser console for tokenizer loading errors
2. Verify services can load your tokenizer configuration
3. Test with simple prompts first
4. Compare with existing working models

## Advanced Features

### Reasoning/Thinking Mode Support

Many modern models support reasoning or "thinking" capabilities where they can show their chain-of-thought before providing the final answer. This is implemented through special template configurations.

#### Models with Native Thinking Support

For models like GPT-OSS (with harmony format), QwQ, DeepSeek-R1, and others that have native reasoning tokens:

```typescript
// In instruction template
[
  'your-reasoning-model',
  {
    BOS: '',
    SYSTEM_START: '<|start|>system<|message|>',
    SYSTEM_END: '<|end|>\n',
    INPUT_START: '<|start|>user<|message|>',
    INPUT_END: '<|end|>\n',
    // Use analysis channel for reasoning
    OUTPUT_START: '<|start|>assistant<|channel|>analysis<|message|>',
    OUTPUT_END: '<|end|>\n<|start|>assistant<|channel|>final<|message|>',
    EOS: '<|return|>',
    STOPS: ['<|start|>', '<|end|>', '<|message|>', '<|channel|>', '<|return|>'],
  },
],
```

#### Models with <think> Tags

For models that use `<think>` tags for reasoning:

```typescript
// In instruction template  
[
  'thinking-model',
  {
    BOS: '<s>',
    SYSTEM_START: '<|system|>',
    SYSTEM_END: '<|/system|>',
    INPUT_START: '<|user|>',
    INPUT_END: '<|/user|>',
    OUTPUT_START: '<|assistant|><think>',
    OUTPUT_END: '</think>',
    EOS: '</s>',
    STOPS: ['<|user|>', '<|assistant|>', '<|system|>', '</think>', '<think>'],
  },
],
```

#### Enable Reasoning in Model Configuration

Set the `has_reasoning` flag to enable reasoning features:

```typescript
{
  "has_reasoning": true,  // Enables analysis/thinking display in UI
  "strategy": "your-reasoning-model"
}
```

This enables:
- **Chain-of-thought display**: Users can see the model's reasoning process
- **Reasoning analysis**: The thinking content is processed separately from the final response
- **Better debugging**: Helps understand model decision-making

#### Custom Reasoning Prompts

For advanced reasoning control, use `OUTPUT_ASK` to inject reasoning instructions:

```typescript
OUTPUT_ASK: '<think>Let me think about this step by step:\n1. Analyze the user\'s request\n2. Consider the context\n3. Formulate appropriate response</think>',
```

### Custom Template Processing

For models with special formatting needs, you can extend the template system with additional template fields and processing logic.

## Platform Repository Integration

**Important**: Once your model is fully integrated and tested in this project, you must also copy the type definitions to the **platform repository** to enable admin configuration.

### Required Steps for Platform Integration

1. **Copy enum definitions** from `apps/services/src/services/text/data/rpModelTypes.mts` to the platform repo:
   ```typescript
   // Copy these to platform repo
   export enum RPModelTokenizers {
     YOUR_MODEL = 'your-model',
   }
   
   export enum RPModelStrategy {
     YOUR_MODEL = 'your-model', 
   }
   
   export enum PresetType {
     YOUR_MODEL_PRESET = 'YOUR_MODEL_PRESET',
   }
   ```

2. **Update validation logic** in the platform repo to recognize the new types

3. **Test admin interface** to ensure the new model options appear in dropdowns and configuration forms

### Why This Is Necessary

The platform repository contains the admin interface that allows administrators to:
- Configure new model endpoints
- Select tokenizers and strategies from dropdowns  
- Set up presets and permissions
- Manage model availability for users

Without copying the types to the platform repo, administrators won't be able to configure your new model through the admin interface, even if it works perfectly in the main MikuGG application.

## Summary

Adding new model support requires:

1. ✅ **Tokenizer setup** - Add tokenizer type and loading logic
2. ✅ **Instruction template** - Define prompt formatting strategy  
3. ✅ **Preset configuration** - Set optimal generation parameters
4. ✅ **Type definitions** - Add enums and interfaces
5. ✅ **Integration testing** - Verify end-to-end functionality
6. ✅ **Platform repo sync** - Copy types to enable admin configuration

Following this guide ensures your new model integrates seamlessly with MikuGG's chat system, bot directory, generation pipeline, and admin interface.