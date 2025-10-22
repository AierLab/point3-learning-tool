const audioRecorder = (() => {
  let mediaRecorder = null;
  let chunks = [];

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone access not supported in this browser.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.start();
  };

  const stopRecording = () => new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error('Recorder not started'));
      return;
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
      resolve(blob);
    };

    mediaRecorder.onerror = (event) => {
      reject(event.error || new Error('Recording failed'));
    };

    mediaRecorder.stop();
  });

  const createAudioUrl = (blob) => URL.createObjectURL(blob);

  return {
    startRecording,
    stopRecording,
    createAudioUrl,
  };
})();

export default audioRecorder;
