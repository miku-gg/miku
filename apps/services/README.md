# Miku Services

This service provides backend APIs for various Miku.gg functionalities.

## Translation Service

The translation service provides an endpoint to translate visual novels from one language to another.

### Endpoints

#### POST `/translate`

Translates a novel JSON file from a remote endpoint.

**Request Body:**

```json
{
  "jsonName": "some_novel.json",
  "language": "es"
}
```

**Response:**
Server-Sent Events stream with progress updates and final result:

```
data: {"type": "progress", "percentage": 25}
data: {"type": "complete", "filename": "some_novel_12345_es.json"}
```

#### GET `/translate/download/:filename`

Downloads a translated file.

### Environment Variables

The following environment variables are required for the translation service:

- `NOVEL_DOWNLOAD_ENDPOINT` - Base URL to download novel JSON files (e.g., `https://api.example.com/novels`)
- `ASSISTANT_API_ENDPOINT` - OpenAI-compatible API endpoint for translations (e.g., `https://api.openai.com/v1/chat/completions`)
- `ASSISTANT_API_KEY` - API key for the translation service
- `ASSISTANT_API_MODEL` - Model to use for translation (optional, defaults to `gpt-4o-mini`)

### Supported Languages

- `es` - Spanish
- `es_ar` - Spanish (Argentina)
- `pt` - Portuguese
- `pt_br` - Portuguese (Brazil)
- `fr` - French
- `de` - German
- `ru` - Russian
- `jp` - Japanese
- `pl` - Polish

### Usage Example

```bash
# Start translation
curl -X POST http://localhost:8484/translate \
  -H "Content-Type: application/json" \
  -d '{"jsonName": "my_novel.json", "language": "es"}'

# Download translated file
curl -O http://localhost:8484/translate/download/my_novel_12345_es.json
```

The service processes translations in batches of 50 with 10-second delays between batches to respect API rate limits. Progress is streamed in real-time via Server-Sent Events.
