
export type EmotionTemplate = {
  id: string;
  name: string;
  emotionIds: string[];
  similarityMatrix: { [emotion: string]: string[] };
}

export const emotionTemplates: EmotionTemplate[] = [
  {
    id: 'base-emotions',
    name: 'Regular Emotions',
    emotionIds: ['angry', 'sad', 'happy', 'disgusted', 'begging', 'scared', 'excited', 'hopeful', 'longing', 'proud', 'neutral', 'rage', 'scorn', 'blushed', 'pleasure', 'lustful', 'shocked', 'confused', 'disappointed', 'embarrassed', 'guilty', 'shy', 'frustrated', 'annoyed', 'exhausted', 'tired', 'curious', 'intrigued', 'amused'],
    similarityMatrix: {
      angry: [
        'frustrated',  'disappointed', 'scared',
        'annoyed',     'disgusted',    'tired',
        'embarrassed', 'confused',     'excited',
        'shocked',     'shy',          'guilty',
        'proud',       'curious',      'exhausted',
        'lustful',     'rage',         'sad',
        'happy',       'intrigued',    'amused',
        'hopeful',     'longing',      'begging',
        'neutral',     'scorn',        'blushed',
        'pleasure'
      ],
      sad: [
        'happy',      'disappointed', 'rage',
        'angry',      'neutral',      'shocked',
        'frustrated', 'disgusted',    'shy',
        'tired',      'scared',       'embarrassed',
        'annoyed',    'proud',        'hopeful',
        'amused',     'scorn',        'confused',
        'guilty',     'exhausted',    'longing',
        'lustful',    'excited',      'curious',
        'pleasure',   'begging',      'blushed',
        'intrigued'
      ],
      happy: [
        'sad',        'hopeful',   'excited',
        'pleasure',   'proud',     'neutral',
        'angry',      'amused',    'disappointed',
        'frustrated', 'rage',      'guilty',
        'tired',      'lustful',   'confused',
        'annoyed',    'shocked',   'exhausted',
        'shy',        'scared',    'embarrassed',
        'disgusted',  'longing',   'curious',
        'blushed',    'intrigued', 'begging',
        'scorn'
      ],
      disgusted: [
        'shocked',   'disappointed', 'embarrassed',
        'angry',     'frustrated',   'scared',
        'annoyed',   'confused',     'exhausted',
        'amused',    'excited',      'proud',
        'intrigued', 'tired',        'scorn',
        'guilty',    'lustful',      'sad',
        'blushed',   'curious',      'rage',
        'shy',       'neutral',      'hopeful',
        'begging',   'happy',        'pleasure',
        'longing'
      ],
      begging: [
        'longing',     'angry',        'shy',
        'hopeful',     'confused',     'frustrated',
        'embarrassed', 'lustful',      'annoyed',
        'curious',     'rage',         'scared',
        'disgusted',   'tired',        'guilty',
        'exhausted',   'proud',        'intrigued',
        'scorn',       'disappointed', 'pleasure',
        'sad',         'shocked',      'excited',
        'blushed',     'neutral',      'amused',
        'happy'
      ],
      scared: [
        'shocked',    'embarrassed',  'angry',
        'confused',   'disgusted',    'excited',
        'shy',        'disappointed', 'tired',
        'frustrated', 'annoyed',      'intrigued',
        'curious',    'exhausted',    'proud',
        'amused',     'hopeful',      'guilty',
        'blushed',    'sad',          'scorn',
        'begging',    'rage',         'happy',
        'neutral',    'longing',      'lustful',
        'pleasure'
      ],
      excited: [
        'intrigued', 'scared',     'disappointed',
        'hopeful',   'proud',      'shocked',
        'confused',  'frustrated', 'amused',
        'angry',     'curious',    'embarrassed',
        'exhausted', 'happy',      'disgusted',
        'tired',     'annoyed',    'pleasure',
        'shy',       'guilty',     'blushed',
        'lustful',   'neutral',    'sad',
        'longing',   'rage',       'begging',
        'scorn'
      ],
      hopeful: [
        'excited',   'happy',       'frustrated',
        'curious',   'proud',       'disappointed',
        'shy',       'scared',      'intrigued',
        'angry',     'confused',    'guilty',
        'tired',     'longing',     'exhausted',
        'lustful',   'neutral',     'sad',
        'begging',   'shocked',     'amused',
        'disgusted', 'embarrassed', 'pleasure',
        'blushed',   'rage',        'annoyed',
        'scorn'
      ],
      longing: [
        'begging',      'lustful',     'pleasure',
        'scorn',        'hopeful',     'angry',
        'curious',      'frustrated',  'shy',
        'disappointed', 'tired',       'intrigued',
        'happy',        'proud',       'rage',
        'annoyed',      'sad',         'excited',
        'exhausted',    'scared',      'guilty',
        'disgusted',    'embarrassed', 'confused',
        'neutral',      'blushed',     'amused',
        'shocked'
      ],
      proud: [
        'excited',   'embarrassed', 'disappointed',
        'disgusted', 'angry',       'hopeful',
        'happy',     'shy',         'frustrated',
        'tired',     'scared',      'confused',
        'guilty',    'shocked',     'amused',
        'lustful',   'exhausted',   'blushed',
        'curious',   'annoyed',     'sad',
        'intrigued', 'pleasure',    'rage',
        'longing',   'begging',     'neutral',
        'scorn'
      ],
      neutral: [
        'happy',      'sad',          'guilty',
        'shy',        'rage',         'curious',
        'hopeful',    'angry',        'shocked',
        'confused',   'tired',        'disgusted',
        'annoyed',    'excited',      'exhausted',
        'scared',     'disappointed', 'pleasure',
        'proud',      'blushed',      'embarrassed',
        'frustrated', 'intrigued',    'longing',
        'lustful',    'begging',      'amused',
        'scorn'
      ],
      rage: [
        'sad',         'angry',        'scorn',
        'annoyed',     'neutral',      'shocked',
        'happy',       'disgusted',    'shy',
        'frustrated',  'lustful',      'begging',
        'scared',      'tired',        'pleasure',
        'embarrassed', 'curious',      'proud',
        'exhausted',   'longing',      'guilty',
        'amused',      'disappointed', 'confused',
        'blushed',     'intrigued',    'excited',
        'hopeful'
      ],
      scorn: [
        'disgusted', 'rage',        'disappointed',
        'longing',   'annoyed',     'scared',
        'angry',     'embarrassed', 'frustrated',
        'sad',       'shocked',     'pleasure',
        'guilty',    'begging',     'lustful',
        'shy',       'amused',      'proud',
        'blushed',   'exhausted',   'tired',
        'confused',  'neutral',     'curious',
        'intrigued', 'happy',       'hopeful',
        'excited'
      ],
      blushed: [
        'embarrassed',  'shy',        'amused',
        'shocked',      'proud',      'scared',
        'excited',      'disgusted',  'confused',
        'intrigued',    'guilty',     'annoyed',
        'angry',        'tired',      'exhausted',
        'disappointed', 'frustrated', 'rage',
        'happy',        'hopeful',    'neutral',
        'curious',      'lustful',    'pleasure',
        'sad',          'scorn',      'begging',
        'longing'
      ],
      pleasure: [
        'happy',     'longing',      'amused',
        'excited',   'lustful',      'guilty',
        'intrigued', 'annoyed',      'proud',
        'rage',      'disappointed', 'curious',
        'scorn',     'hopeful',      'begging',
        'disgusted', 'shy',          'embarrassed',
        'neutral',   'sad',          'frustrated',
        'blushed',   'shocked',      'confused',
        'tired',     'angry',        'scared',
        'exhausted'
      ],
      lustful: [
        'longing', 'angry',       'frustrated',
        'proud',   'disgusted',   'pleasure',
        'guilty',  'hopeful',     'excited',
        'happy',   'exhausted',   'tired',
        'begging', 'rage',        'disappointed',
        'curious', 'embarrassed', 'amused',
        'shy',     'intrigued',   'confused',
        'sad',     'scorn',       'annoyed',
        'blushed', 'shocked',     'scared',
        'neutral'
      ],
      shocked: [
        'disgusted', 'scared',      'disappointed',
        'confused',  'embarrassed', 'excited',
        'amused',    'intrigued',   'angry',
        'shy',       'frustrated',  'annoyed',
        'curious',   'exhausted',   'blushed',
        'tired',     'proud',       'sad',
        'guilty',    'rage',        'hopeful',
        'neutral',   'happy',       'scorn',
        'begging',   'pleasure',    'lustful',
        'longing'
      ],
      confused: [
        'frustrated', 'scared',       'curious',
        'shocked',    'intrigued',    'embarrassed',
        'excited',    'angry',        'disgusted',
        'amused',     'disappointed', 'annoyed',
        'tired',      'shy',          'exhausted',
        'guilty',     'proud',        'hopeful',
        'blushed',    'begging',      'happy',
        'neutral',    'sad',          'lustful',
        'rage',       'pleasure',     'longing',
        'scorn'
      ],
      disappointed: [
        'frustrated',  'disgusted', 'shocked',
        'embarrassed', 'angry',     'annoyed',
        'excited',     'scared',    'confused',
        'sad',         'tired',     'proud',
        'exhausted',   'hopeful',   'intrigued',
        'amused',      'guilty',    'scorn',
        'happy',       'curious',   'shy',
        'lustful',     'longing',   'blushed',
        'pleasure',    'begging',   'rage',
        'neutral'
      ],
      embarrassed: [
        'disgusted',  'annoyed',      'scared',
        'frustrated', 'disappointed', 'shocked',
        'proud',      'amused',       'confused',
        'angry',      'shy',          'blushed',
        'excited',    'tired',        'exhausted',
        'intrigued',  'guilty',       'curious',
        'sad',        'scorn',        'begging',
        'hopeful',    'lustful',      'happy',
        'rage',       'pleasure',     'neutral',
        'longing'
      ],
      guilty: [
        'angry',        'disgusted',   'confused',
        'disappointed', 'proud',       'tired',
        'neutral',      'embarrassed', 'shocked',
        'hopeful',      'scared',      'shy',
        'excited',      'lustful',     'frustrated',
        'pleasure',     'blushed',     'happy',
        'exhausted',    'annoyed',     'curious',
        'amused',       'intrigued',   'sad',
        'begging',      'scorn',       'rage',
        'longing'
      ],
      shy: [
        'scared',    'embarrassed',  'angry',
        'shocked',   'curious',      'blushed',
        'tired',     'proud',        'confused',
        'annoyed',   'hopeful',      'frustrated',
        'neutral',   'excited',      'guilty',
        'sad',       'disappointed', 'intrigued',
        'begging',   'rage',         'amused',
        'exhausted', 'longing',      'disgusted',
        'happy',     'lustful',      'scorn',
        'pleasure'
      ],
      frustrated: [
        'disappointed', 'annoyed',     'angry',
        'confused',     'embarrassed', 'exhausted',
        'tired',        'disgusted',   'excited',
        'scared',       'hopeful',     'intrigued',
        'shocked',      'amused',      'proud',
        'curious',      'lustful',     'shy',
        'sad',          'guilty',      'happy',
        'begging',      'longing',     'rage',
        'scorn',        'blushed',     'pleasure',
        'neutral'
      ],
      annoyed: [
        'frustrated',   'embarrassed', 'angry',
        'disappointed', 'amused',      'disgusted',
        'tired',        'intrigued',   'scared',
        'exhausted',    'confused',    'shocked',
        'curious',      'shy',         'excited',
        'rage',         'scorn',       'proud',
        'sad',          'guilty',      'blushed',
        'begging',      'happy',       'pleasure',
        'neutral',      'longing',     'lustful',
        'hopeful'
      ],
      exhausted: [
        'tired',    'frustrated', 'disgusted',
        'annoyed',  'excited',    'disappointed',
        'angry',    'scared',     'embarrassed',
        'confused', 'shocked',    'amused',
        'proud',    'intrigued',  'hopeful',
        'guilty',   'lustful',    'shy',
        'blushed',  'happy',      'curious',
        'begging',  'sad',        'rage',
        'neutral',  'longing',    'scorn',
        'pleasure'
      ],
      tired: [
        'exhausted', 'frustrated', 'angry',
        'scared',    'annoyed',    'disappointed',
        'confused',  'excited',    'embarrassed',
        'disgusted', 'shy',        'proud',
        'amused',    'curious',    'intrigued',
        'guilty',    'shocked',    'sad',
        'hopeful',   'happy',      'lustful',
        'neutral',   'blushed',    'begging',
        'longing',   'rage',       'pleasure',
        'scorn'
      ],
      curious: [
        'intrigued',    'confused', 'excited',
        'scared',       'shy',      'hopeful',
        'angry',        'shocked',  'amused',
        'frustrated',   'tired',    'annoyed',
        'disappointed', 'proud',    'embarrassed',
        'disgusted',    'neutral',  'longing',
        'guilty',       'begging',  'lustful',
        'exhausted',    'pleasure', 'rage',
        'happy',        'sad',      'blushed',
        'scorn'
      ],
      intrigued: [
        'curious',      'excited',     'amused',
        'confused',     'annoyed',     'shocked',
        'scared',       'frustrated',  'disgusted',
        'disappointed', 'embarrassed', 'tired',
        'angry',        'hopeful',     'shy',
        'exhausted',    'blushed',     'pleasure',
        'guilty',       'proud',       'longing',
        'begging',      'lustful',     'rage',
        'neutral',      'happy',       'scorn',
        'sad'
      ],
      amused: [
        'intrigued', 'annoyed',    'embarrassed',
        'shocked',   'excited',    'confused',
        'disgusted', 'frustrated', 'disappointed',
        'blushed',   'curious',    'scared',
        'pleasure',  'tired',      'angry',
        'happy',     'proud',      'exhausted',
        'shy',       'guilty',     'sad',
        'hopeful',   'lustful',    'rage',
        'scorn',     'neutral',    'begging',
        'longing'
      ]
    },
  },
  {
    id: 'lewd-emotions',
    name: 'Lewd Emotions',
    emotionIds: ['desire', 'pleasure', 'anticipation', 'condescension', 'arousal', 'ecstasy', 'relief', 'release', 'intensity', 'comfort', 'humiliation', 'discomfort', 'submission', 'pain', 'teasing', 'arrogant'],
    similarityMatrix: {
      desire: [
        'pleasure',  'discomfort',
        'arousal',   'anticipation',
        'ecstasy',   'comfort',
        'intensity', 'submission',
        'relief',    'humiliation',
        'pain',      'condescension',
        'teasing',   'arrogant',
        'release'
      ],
      pleasure: [
        'desire',        'comfort',
        'discomfort',    'relief',
        'arousal',       'ecstasy',
        'pain',          'humiliation',
        'teasing',       'anticipation',
        'submission',    'intensity',
        'condescension', 'release',
        'arrogant'
      ],
      anticipation: [
        'teasing',       'arousal',
        'desire',        'pleasure',
        'relief',        'discomfort',
        'comfort',       'ecstasy',
        'condescension', 'humiliation',
        'intensity',     'pain',
        'submission',    'arrogant',
        'release'
      ],
      condescension: [
        'humiliation',  'arrogant',
        'discomfort',   'comfort',
        'teasing',      'relief',
        'anticipation', 'pleasure',
        'desire',       'submission',
        'ecstasy',      'pain',
        'intensity',    'arousal',
        'release'
      ],
      arousal: [
        'pleasure',      'teasing',
        'anticipation',  'desire',
        'relief',        'discomfort',
        'ecstasy',       'intensity',
        'humiliation',   'comfort',
        'pain',          'submission',
        'arrogant',      'release',
        'condescension'
      ],
      ecstasy: [
        'pleasure',     'arousal',
        'desire',       'humiliation',
        'pain',         'discomfort',
        'comfort',      'relief',
        'anticipation', 'teasing',
        'intensity',    'condescension',
        'submission',   'arrogant',
        'release'
      ],
      relief: [
        'comfort',      'pleasure',
        'discomfort',   'pain',
        'humiliation',  'arousal',
        'teasing',      'submission',
        'release',      'intensity',
        'anticipation', 'condescension',
        'desire',       'ecstasy',
        'arrogant'
      ],
      release: [
        'relief',        'pain',
        'submission',    'comfort',
        'arousal',       'teasing',
        'pleasure',      'humiliation',
        'desire',        'ecstasy',
        'arrogant',      'discomfort',
        'intensity',     'anticipation',
        'condescension'
      ],
      intensity: [
        'arousal',       'relief',
        'desire',        'pain',
        'discomfort',    'pleasure',
        'comfort',       'humiliation',
        'anticipation',  'ecstasy',
        'submission',    'teasing',
        'condescension', 'release',
        'arrogant'
      ],
      comfort: [
        'discomfort',    'pain',
        'relief',        'pleasure',
        'humiliation',   'submission',
        'condescension', 'desire',
        'teasing',       'arousal',
        'ecstasy',       'release',
        'intensity',     'anticipation',
        'arrogant'
      ],
      humiliation: [
        'condescension', 'discomfort',
        'submission',    'relief',
        'arrogant',      'pleasure',
        'comfort',       'teasing',
        'pain',          'arousal',
        'ecstasy',       'desire',
        'intensity',     'anticipation',
        'release'
      ],
      discomfort: [
        'comfort',      'humiliation',
        'pleasure',     'condescension',
        'pain',         'relief',
        'desire',       'arousal',
        'anticipation', 'intensity',
        'teasing',      'ecstasy',
        'submission',   'arrogant',
        'release'
      ],
      submission: [
        'humiliation',   'comfort',
        'relief',        'pain',
        'release',       'desire',
        'pleasure',      'discomfort',
        'condescension', 'arousal',
        'intensity',     'ecstasy',
        'anticipation',  'teasing',
        'arrogant'
      ],
      pain: [
        'comfort',       'discomfort',
        'relief',        'pleasure',
        'humiliation',   'submission',
        'release',       'intensity',
        'ecstasy',       'arousal',
        'teasing',       'desire',
        'arrogant',      'anticipation',
        'condescension'
      ],
      teasing: [
        'anticipation', 'arousal',
        'pleasure',     'relief',
        'humiliation',  'condescension',
        'comfort',      'arrogant',
        'discomfort',   'pain',
        'ecstasy',      'desire',
        'submission',   'intensity',
        'release'
      ],
      arrogant: [
        'condescension', 'humiliation',
        'teasing',       'comfort',
        'pain',          'arousal',
        'discomfort',    'desire',
        'relief',        'pleasure',
        'anticipation',  'ecstasy',
        'submission',    'release',
        'intensity'
      ]
    }
  },
];