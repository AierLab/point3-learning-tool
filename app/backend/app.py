from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import uuid
import librosa
import numpy as np
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'audioSelf')
AUDIO_ORIGIN = os.path.join(BASE_DIR, 'audioOrigin')
DATABASE_ORIGIN = os.path.join(BASE_DIR, 'databaseOrigin')
DATABASE_SELF = os.path.join(BASE_DIR, 'databaseSelf')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_ORIGIN, exist_ok=True)
os.makedirs(DATABASE_ORIGIN, exist_ok=True)
os.makedirs(DATABASE_SELF, exist_ok=True)

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024


def load_origin_records():
  records = []
  if not os.path.isdir(DATABASE_ORIGIN):
    return records

  for filename in os.listdir(DATABASE_ORIGIN):
    if filename.endswith('.json'):
      filepath = os.path.join(DATABASE_ORIGIN, filename)
      try:
        with open(filepath, 'r', encoding='utf-8') as handle:
          record = json.load(handle)
          records.append(record)
      except json.JSONDecodeError:
        continue
  return records


def load_origin_record_by_id(material_id):
  for record in load_origin_records():
    if record.get('id') == material_id:
      return record
  return None


def load_self_record_by_id(record_id):
  filepath = os.path.join(DATABASE_SELF, f"{record_id}.json")
  if not os.path.exists(filepath):
    return None
  with open(filepath, 'r', encoding='utf-8') as handle:
    return json.load(handle)


def save_self_record(record_data):
  filepath = os.path.join(DATABASE_SELF, f"{record_data['id']}.json")
  with open(filepath, 'w', encoding='utf-8') as handle:
    json.dump(record_data, handle, indent=2)


def ensure_text_file(record):
  text_filename = record.get('text_file_dir') or f"{record.get('title', 'material')}.txt"
  if text_filename.endswith('.json'):
    text_filename = text_filename.replace('.json', '.txt')
  text_path = os.path.join(DATABASE_ORIGIN, text_filename)
  os.makedirs(os.path.dirname(text_path), exist_ok=True)
  if not os.path.exists(text_path):
    with open(text_path, 'a', encoding='utf-8'):
      pass
  return text_filename, text_path


@app.route('/material/list', methods=['GET'])
def get_learning_materials():
  try:
    levels_param = request.args.get('levels', '')
    levels = None
    if levels_param.strip():
      levels = []
      for item in levels_param.split(','):
        item = item.strip()
        if item:
          try:
            levels.append(int(item))
          except ValueError:
            pass

    materials = []
    for record in load_origin_records():
      level = record.get('level')
      if levels and level not in levels:
        continue

      audio_path = os.path.join(AUDIO_ORIGIN, record.get('audio_file_dir', ''))
      length = 0.0
      if os.path.exists(audio_path):
        try:
          y, sr = librosa.load(audio_path, sr=None)
          length = float(librosa.get_duration(y=y, sr=sr))
        except Exception:
          length = 0.0

      materials.append({
        'id': record.get('id'),
        'title': record.get('title'),
        'length': length,
        'level': level,
        'update_time': record.get('upgrade_time'),
      })

    return jsonify({'success': True, 'materials': materials})
  except Exception as exc:
    return jsonify({'success': False, 'error': str(exc)}), 500


@app.route('/material/file', methods=['GET'])
def get_selected_file():
  material_id = request.args.get('id')
  if not material_id:
    return jsonify({'success': False, 'error': 'Material ID is required'}), 400

  record = load_origin_record_by_id(material_id)
  if record is None:
    return jsonify({'success': False, 'error': 'Material not found'}), 404

  text_filename, text_path = ensure_text_file(record)
  text_content = ''
  if os.path.exists(text_path):
    with open(text_path, 'r', encoding='utf-8') as handle:
      text_content = handle.read()

  return jsonify({
    'success': True,
    'material': {
      'id': record.get('id'),
      'title': record.get('title'),
      'text': text_content,
      'audio_url': f"/audio/origin/{record.get('audio_file_dir')}",
      'level': record.get('level'),
      'update_time': record.get('upgrade_time'),
    }
  })


@app.route('/record/upload', methods=['POST'])
def upload_recording():
  if 'audio' not in request.files:
    return jsonify({'success': False, 'error': 'No audio file provided'}), 400

  file = request.files['audio']
  material_id = request.form.get('material_id', '')
  if file.filename == '':
    return jsonify({'success': False, 'error': 'Empty filename'}), 400

  filename = secure_filename(file.filename)
  record_id = str(uuid.uuid4())
  if '.' in filename:
    extension = filename.rsplit('.', 1)[1].lower()
  else:
    extension = 'wav'
  saved_filename = f"{record_id}.{extension}"
  save_path = os.path.join(UPLOAD_FOLDER, saved_filename)
  file.save(save_path)

  origin_record = load_origin_record_by_id(material_id) if material_id else None

  record_data = {
    'id': record_id,
    'material_id': material_id,
    'audio_file': saved_filename,
    'created_at': datetime.utcnow().isoformat(),
    'material_title': origin_record.get('title') if origin_record else None,
  }
  save_self_record(record_data)

  return jsonify({
    'success': True,
    'record_id': record_id,
    'filename': saved_filename,
    'material_id': material_id,
    'timestamp': record_data['created_at'],
  })


def load_waveform(file_path, samples=500):
  y, sr = librosa.load(file_path, sr=None)
  duration = librosa.get_duration(y=y, sr=sr)
  total_samples = y.shape[0]
  block_size = max(1, total_samples // samples)
  waveform = []
  for index in range(samples):
    start = index * block_size
    end = min(start + block_size, total_samples)
    block = y[start:end]
    if block.size == 0:
      value = 0.0
    else:
      value = float(np.mean(np.abs(block)))
    waveform.append(value)
  smoothed = librosa.effects.harmonic(y)
  smoothed = smoothed[:total_samples: block_size]
  smoothed = [float(abs(val)) for val in smoothed[:samples]]
  return waveform, smoothed, duration


@app.route('/eval/wavepattern', methods=['GET'])
def get_recording_wave():
  record_id = request.args.get('id')
  if not record_id:
    return jsonify({'success': False, 'error': 'record_id is required'}), 400
  record = load_self_record_by_id(record_id)
  if record is None:
    return jsonify({'success': False, 'error': 'Record not found'}), 404
  audio_path = os.path.join(UPLOAD_FOLDER, record['audio_file'])
  if not os.path.exists(audio_path):
    return jsonify({'success': False, 'error': 'Audio file missing'}), 404

  waveform, smoothed, duration = load_waveform(audio_path)
  return jsonify({
    'success': True,
    'waveform': waveform,
    'smoothed': smoothed,
    'duration': duration,
  })


@app.route('/eval/score', methods=['GET'])
def get_recording_score():
  record_id = request.args.get('record_id')
  if not record_id:
    return jsonify({'success': False, 'error': 'record_id is required'}), 400
  record = load_self_record_by_id(record_id)
  if record is None:
    return jsonify({'success': False, 'error': 'Record not found'}), 404

  audio_path = os.path.join(UPLOAD_FOLDER, record['audio_file'])
  if not os.path.exists(audio_path):
    return jsonify({'success': False, 'error': 'Audio file missing'}), 404

  y, sr = librosa.load(audio_path, sr=None)
  energy = float(np.mean(np.abs(y)))
  pitch_var = float(np.var(librosa.feature.rms(y=y)))

  overall = min(100.0, max(0.0, 60 + energy * 200))
  fluency = min(100.0, max(0.0, 55 + (1 - pitch_var) * 150))
  accuracy = min(100.0, max(0.0, overall - 5 + np.random.uniform(-5, 5)))

  return jsonify({
    'success': True,
    'evaluation': {
      'overall': round(overall, 1),
      'fluency': round(fluency, 1),
      'accuracy': round(accuracy, 1),
      'record_id': record_id,
      'timestamp': record.get('created_at'),
    }
  })


@app.route('/audio/origin/<path:filename>', methods=['GET'])
def serve_origin_audio(filename):
  file_path = os.path.join(AUDIO_ORIGIN, filename)
  if not os.path.exists(file_path):
    return jsonify({'success': False, 'error': 'Audio not found'}), 404
  return send_file(file_path)


@app.route('/audio/self/<path:filename>', methods=['GET'])
def serve_self_audio(filename):
  file_path = os.path.join(UPLOAD_FOLDER, filename)
  if not os.path.exists(file_path):
    return jsonify({'success': False, 'error': 'Audio not found'}), 404
  return send_file(file_path)


@app.route('/reference/upload', methods=['POST'])
def upload_reference_audio():
  if 'audio' not in request.files:
    return jsonify({'success': False, 'error': 'No audio file provided'}), 400

  file = request.files['audio']
  material_id = request.form.get('material_id', '')
  text_content = request.form.get('text')

  if file.filename == '' or not material_id:
    return jsonify({'success': False, 'error': 'Missing file or material_id'}), 400

  record = load_origin_record_by_id(material_id)
  if record is None:
    return jsonify({'success': False, 'error': 'Material not found'}), 404

  audio_filename = record.get('audio_file_dir')
  audio_path = os.path.join(AUDIO_ORIGIN, audio_filename)

  if os.path.exists(audio_path):
    backup_path = audio_path + '.backup'
    if os.path.exists(backup_path):
      os.remove(backup_path)
    os.rename(audio_path, backup_path)

  file.save(audio_path)

  text_filename, text_path = ensure_text_file(record)
  if isinstance(text_content, str):
    with open(text_path, 'w', encoding='utf-8') as text_file:
      text_file.write(text_content)

  record['text_file_dir'] = text_filename
  record['upgrade_time'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
  metadata_path = os.path.join(DATABASE_ORIGIN, f"{record['title']}.json")
  with open(metadata_path, 'w', encoding='utf-8') as handle:
    json.dump(record, handle, indent=2)

  return jsonify({
    'success': True,
    'message': 'Reference audio uploaded successfully',
    'material_id': material_id
  })


@app.route('/reference/delete', methods=['DELETE'])
def delete_reference_audio():
  material_id = request.args.get('material_id')
  if not material_id:
    return jsonify({'success': False, 'error': 'Material ID is required'}), 400

  record = load_origin_record_by_id(material_id)
  if record is None:
    return jsonify({'success': False, 'error': 'Material not found'}), 404

  audio_filename = record.get('audio_file_dir')
  audio_path = os.path.join(AUDIO_ORIGIN, audio_filename)
  backup_path = audio_path + '.backup'

  if os.path.exists(backup_path):
    if os.path.exists(audio_path):
      os.remove(audio_path)
    os.rename(backup_path, audio_path)
    return jsonify({'success': True, 'message': 'Reference audio deleted, backup restored'})

  return jsonify({'success': False, 'error': 'No backup found to restore'}), 404


@app.route('/health', methods=['GET'])
def health_check():
  return jsonify({'status': 'ok', 'service': 'Point3 Learning Tool API'})


if __name__ == '__main__':
  app.run(debug=True, host='127.0.0.1', port=5000)
