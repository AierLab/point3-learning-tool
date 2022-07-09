import speech_recognition as sr
import os

class Speech(sr.Recognizer):
    def __init__(self):

        super().__init__()
        
        self.microphone = sr.Microphone()
        with self.microphone as source:
            self.adjust_for_ambient_noise(source, duration = 0.5)

    """
    Using a Microphone for audio input
    """
    def listenMicrophone(self):
        text = None
        client_id = 'xNGm6N467xNNQ-khNfjuFg=='
        client_key = 'kAcFYokTffy_QhppthF0GaaWKugGSodDXsRohg3fk3Vfp_pMvIMtH-u2CP6cwy70Aq9lwowRMvofNkQ4vmrFWA=='
        with self.microphone as source:
            print("Please say something:")
            try:
                audio = self.listen(source, timeout=1, phrase_time_limit=10)
                print("LISTENED")
                text = self.recognize_google(audio, show_all=True)
                #text = self.recognize_houndify(audio, client_id, client_key)
                print(text)
            except sr.WaitTimeoutError as e:
                print(e)
            except sr.UnknownValueError:
                print("Speech Recognition could not understand audio")
            except sr.RequestError as e:
                print("Could not request results from Google Speech Recognition service; {0}".format(e))      
        return text

def main():
    speech = Speech()
    speech.listenMicrophone()

    
if __name__ == "__main__":
    main()