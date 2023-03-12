import os
from flask import Flask, request
from sentence_transformers import SentenceTransformer, util
import pandas as pd
import wget


model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

DB_ENDPOINT = os.environ.get("DB_ENDPOINT") or "http://localhost:8585/embeddings"


@app.route('/search', methods=['POST'])
def find_similarity():
  content = request.get_json()
  embeddings_file_hash = content["embeddings_file_hash"]
  text = content["text"]
  limit = content["limit"] or 1
  text_embedding = model.encode(text, convert_to_tensor=True)
  file_path = './_temp/' + embeddings_file_hash
  wget.download(DB_ENDPOINT + "/" + embeddings_file_hash, file_path)
  df = pd.read_csv(file_path)
  cosine_scores = util.cos_sim(text_embedding, df["embeddings"].tolist())
  df['scores'] = cosine_scores[0].tolist()
  df.sort_values('scores', ascending=False).head(limit)['id'].values[0]


if __name__ == '__main__':
    app.run(debug=True, port=8600)
