import os
from flask import Flask, request, send_file
from sentence_transformers import SentenceTransformer
import pandas as pd
from werkzeug.utils import secure_filename
from waitress import serve

# load embeddings model
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', device='cpu')
UPLOAD_FOLDER = '_temp'
ALLOWED_EXTENSIONS = {'csv'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/encode', methods=['POST'])
def encode_single_text():
  content = request.get_json()
  text = content["text"]
  embedding = model.encode(text, convert_to_tensor=True)
  return embedding.tolist()

@app.route('/encode_csv', methods=['POST'])
def encode_csv():
  if 'file' not in request.files:
      return 'No file', 400
  file = request.files['file']
  if file.filename == '':
      return 'No file', 400
  if file and allowed_file(file.filename):
      filename = secure_filename(file.filename)
      file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
      file.save(file_path)
      df = pd.read_csv(file_path)
      embeddings = model.encode(df["text"], convert_to_tensor=True).tolist()
      df_embeddings = pd.DataFrame()
      df_embeddings["id"] = df["id"]
      df_embeddings["embedding"] = embeddings
      embeddings_file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'embeddings_' + filename)
      df_embeddings.to_csv(embeddings_file_path, index=False)
      
      return send_file(embeddings_file_path, as_attachment=True)
  return 'File not allowed', 400

if __name__ == '__main__':
    if os.environ.get('PROD') == '1':
        print("Running in production mode...")
        serve(app, host='0.0.0.0', port=8080)
    else:
        app.run(debug=True, port=8600)
