from flask import Flask
from engine.align import Aligner

app = Flask(__name__)


''' Input: a list of selected levels to select the material required. E.g: [4, 5, 6]
    Return:  a json dictionary. "id: string, title: string, length: float, level: int, update_time: date" '''
@app.route('/material/list', methods=['GET'])
def get_learning_materials():
    pass


""" Input: the id of the selected material. E.g: "d290f1ee-6c54-4b01-90e6-d701748f0851"
    Return: Load the material to the app."""
@app.route('/material/file', methods=['GET'])
def get_selected_file():
   pass


""" Input: Send recording to the backend server.
    Return: the record ID"""
@app.route('/record/upload', methods=['POST'])
def upload_recording():
   pass


""" Input: Record ID
    Return: List of float, used to plot a smoothed wave"""
@app.route('/eval/wavepattern', methods=['GET'])
def get_recording_wave():
   pass


""" Input: Record ID
    Return: Json: id, timeA, timeB, scoreK, scoreD, scoreP"""
@app.route('/eval/score', methods=['GET'])
def get_recording_score():
   forced = True
   model = 'charsiu/en_w2v2_tiny_fc_10ms'
   aligner = Aligner(model, forced)
   pass


if __name__ == '__main__':
   app.run(debug=True)


