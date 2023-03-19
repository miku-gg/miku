import os
import math
from sentence_transformers import SentenceTransformer, util
import pandas as pd
from werkzeug.utils import secure_filename

# load embeddings model
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', device='cpu')

def encode_csv(file_path):
  df = pd.read_csv(file_path)
  embeddings = model.encode(df["text"], convert_to_tensor=True).tolist()
  df_embeddings = pd.DataFrame()
  df_embeddings["id"] = df["id"]
  df_embeddings["embedding"] = embeddings
  return df_embeddings

def encode_test_cases():
  file_path = os.path.join(os.path.dirname(__file__), 'emotions_test_cases.csv')
  return encode_csv(file_path)

def encode_candidates():
  csv_filenames = [f for f in sorted(os.listdir('emotions_candidates')) if f.endswith('.csv')]
  result = []
  for csv_filename in csv_filenames:
    file_path = os.path.join(os.path.dirname(__file__), 'emotions_candidates', csv_filename)
    df = encode_csv(file_path)
    result.append({'filename': csv_filename, 'df': df})
  return result

def run_test():
  test_cases_df = encode_test_cases()
  candidates = encode_candidates()
  
  for candidate in candidates:
    candidate_df = candidate['df']
    candidate_filename = candidate['filename']
    print('Testing candidate: ' + candidate_filename)
    cosine_scores = util.cos_sim(test_cases_df["embedding"], candidate_df["embedding"])
    points = len(test_cases_df)
    for i in range(len(test_cases_df)):
      candidate_df['scores'] = cosine_scores[i].tolist()
      result = candidate_df.sort_values('scores', ascending=False).head(1)['id'].values[0]
      #print(result, end=',')
      #print(test_cases_df.iloc[i]['id'])
      if result != test_cases_df.iloc[i]['id']:
        points -= 1
    print(math.ceil(100 * (points/len(test_cases_df))), end='')
    print('%')

run_test()