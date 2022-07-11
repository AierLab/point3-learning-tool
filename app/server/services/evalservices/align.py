import os
import sys
import torch
import librosa
import soundfile as sf
import scipy.io.wavfile as wavfile

charsiu_dir = 'charsiu'
os.chdir(charsiu_dir)
sys.path.insert(0,'src')

from Charsiu import charsiu_predictive_aligner, charsiu_forced_aligner

def resampleWave(wavPath):
    signal, sr = sf.read(wavPath)
    if len(signal.shape) == 2:
        signal = signal[:, 0]

    if sr != 16000:
        signal = librosa.resample(signal, sr, 16000)
        wavPath = wavPath[:-4] + "_resampled.wav"
        wavfile.write(wavPath, 16000, signal)

    return wavPath

def calculateKD(stdAlign, usrAlign):
    # TODO - Figure out how calculate the KD values given 2 alignments
    kValue = 0
    dValue = 0
    return kValue, dValue

class Aligner(object):
    def __init__(self, aligner, forced):
        self.forced = forced
        if forced:
            self.aligner = charsiu_forced_aligner(aligner=aligner)
        else:
            self.aligner = charsiu_predictive_aligner(aligner=aligner)

    def forcedAlign(self, wavPath, textPath):
        assert self.forced == True

        with open(textPath, "r") as f:
            wavPath = resampleWave(wavPath)
            text = f.readlines()[0]
            return self.aligner.align(audio=wavPath, text=text)

    # TODO - Textless Alignment to be added in future versions
    # def textLessAlign(self, wavPath):
    #     wavPath = resampleWave(wavPath)
    #
    #     return self.aligner.align(wavPath)

    def getScore(self, stdAudioPath, usrAudioPath, transcrPath):
        stdAlign = self.forcedAlign(stdAudioPath, transcrPath)
        usrAlign = self.forcedAlign(usrAudioPath, transcrPath)
        return calculateKD(stdAlign, usrAlign)


def main():
    forced = True
    model = 'charsiu/en_w2v2_tiny_fc_10ms'

    torch.cuda.empty_cache()
    if forced:
        aligner = Aligner(model, forced)
        sample_wav = "sample_data/lucier.wav"
        sample_txt = "sample_data/lucier.txt"
        alignment = aligner.forcedAlign(sample_wav, sample_txt)
    else:
        aligner = Aligner(model)
        sample_wav = "sample_data/lucier.wav"
        alignment = aligner.textLessAlign(sample_wav)

    print(alignment)

if __name__ == '__main__':
    main()
