import OpenAI from 'openai';
import similarity from 'compute-cosine-similarity';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored in an environment variable
});

const DEFAULT_EMOTION = ['angry', 'sad', 'happy', 'disgusted', 'begging', 'scared', 'excited', 'hopeful', 'longing', 'proud', 'neutral', 'rage', 'scorn', 'blushed', 'pleasure', 'lustful', 'shocked', 'confused', 'disappointed', 'embarrassed', 'guilty', 'shy', 'frustrated', 'annoyed', 'exhausted', 'tired', 'curious', 'intrigued', 'amused'];
const LEWD_EMOTIONS = ['desire', 'pleasure', 'anticipation', 'condescension', 'arousal', 'ecstasy', 'relief', 'release', 'intensity', 'comfort', 'humiliation', 'discomfort', 'submission', 'pain', 'teasing', 'arrogant'];

// change for different results
const emotions = DEFAULT_EMOTION;

async function generateEmotionMatrix() {
    const emotionEmbeddings: number[][] = [];
    const similarityMatrix: { [emotion: string]: string[] } = {};

    // Retrieve embeddings for each emotion
    for (const emotion of emotions) {
        const response = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: [emotion] // The input can be a single string or an array of strings
        });

        const embeddings = response.data[0].embedding;
        emotionEmbeddings.push(embeddings);
    }

    // Calculate cosine similarity and sort emotions
    for (let i = 0; i < emotionEmbeddings.length; i++) {
        const similarityScores: {emotion: string, score: number}[] = [];

        for (let j = 0; j < emotionEmbeddings.length; j++) {
            const score = similarity(emotionEmbeddings[i], emotionEmbeddings[j]) || 0;
            similarityScores.push({emotion: emotions[j], score});
        }

        // Sort based on similarity score
        similarityScores.sort((a, b) => b.score - a.score);
        // remove first item
        similarityScores.shift();
        
        // Extract sorted emotions
        similarityMatrix[emotions[i]] = similarityScores.map(s => s.emotion);
    }

    console.log(similarityMatrix);
}

generateEmotionMatrix();