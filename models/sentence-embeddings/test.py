from sentence_transformers import SentenceTransformer, util
import pandas as pd
import numpy as np

# Load the dataset
df = pd.read_csv('./statements3.csv')

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
embeddings = model.encode(df['text'], convert_to_tensor=True)
df['embeddings'] = embeddings.tolist()

# read conversation.txt content
lines = open("conversation.txt", "r").readlines()

tt = {}

acc = '';
for i in range(len(lines)):
    acc = lines[i]
    input_statement = acc
    input_embedding = model.encode([input_statement], convert_to_tensor=True)

    cosine_scores = util.cos_sim(input_embedding, embeddings)
    df['scores'] = cosine_scores[0].tolist()
    sorted_df = df.sort_values('scores', ascending=False)
    r = sorted_df.head(1)['id'].values[0]
    print(r, lines[i].replace('\n', ' '))
    if r in tt.keys():
      tt[r] = tt[r] + 1
    else:
      tt[r] = 0
      
for key in tt.keys():
  print(key, tt[key])

# for i in range(len(df['text'])):
# print("{} \t\t Score: {:.4f}".format(df['text'][i], df['scores'][i]))
