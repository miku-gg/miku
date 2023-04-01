import os
from flask import Flask, request, abort
from sentence_transformers import SentenceTransformer, util
import pandas as pd
import wget
from ast import literal_eval
from flask_cors import CORS


model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', device='cpu')

DB_ENDPOINT = os.environ.get("DB_ENDPOINT") or "http://localhost:8585/embeddings"
AUTH_TOKEN = os.environ.get('AUTH_TOKEN')

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def homepage():
  return 'similarity-search'

@app.route('/search', methods=['POST'])
def find_similarity():
  auth_header = request.headers.get('Authorization')
  if not auth_header:
      abort(401, 'Authorization header is missing')

  auth_token = auth_header.split(' ')[-1]
  if AUTH_TOKEN and auth_token != AUTH_TOKEN:
      abort(401, 'Invalid token')

  content = request.get_json()
  embeddings_file_hash = content["embeddings_file_hash"]
  text = content["text"]
  limit = content["limit"] or 10
  text_embedding = model.encode([text], convert_to_tensor=True)
  file_path = './_temp/' + embeddings_file_hash + '.csv'
  wget.download(DB_ENDPOINT + "/" + embeddings_file_hash, file_path)
  df = pd.read_csv(file_path)
  cosine_scores = util.cos_sim(text_embedding, df["embedding"].apply(literal_eval))
  df['scores'] = cosine_scores[0].tolist()
  r = df.sort_values('scores', ascending=False).head(limit)
  result = []
  for row in r.itertuples():
    result.append({
      "id": row.id,
      "score": row.scores
    })
  # remove downloaded file
  os.remove(file_path)
  return result

if __name__ == '__main__':
    if os.environ.get('PROD') == '1':
        from wsgiref.simple_server import make_server
        httpd = make_server('', 8080, app)
        print("Running in production mode...")
        httpd.serve_forever()
    else:
        app.run(host='0.0.0.0', debug=True, port=8601)

