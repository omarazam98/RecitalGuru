
async function getWebAudioMediaStream() {
  if (!window.navigator.mediaDevices) {
    throw new Error(
      "This browser does not support web audio or it is not enabled."
    );
  }

  try {
    return await window.navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellationType: 'browser',
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });
  } catch (e) {
    switch (e.name) {
      case "NotAllowedError":
        throw new Error(
          "A recording device was found but has been disallowed for this application. Enable the device in the browser's settings."
        );

      case "NotFoundError":
        throw new Error(
          "No recording device was found. Please attach a microphone and click Retry."
        );

      default:
        throw e;
    }
  }
}

export async function setupAudio(onPitchDetectedCallback) {
  // Get the browser's audio. Awaits user "allowing" it for the current tab.
  const numAudioSamplesPerAnalysis = 512;
  const numTotalAudioSamples = 1024;

  const mediaStream = await getWebAudioMediaStream();
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const context = new AudioContext({latencyHint: 'interactive'});
  const audioSource = context.createMediaStreamSource(mediaStream);

  const scriptProcessor = context.createScriptProcessor(numAudioSamplesPerAnalysis, 1, 1)
  audioSource.connect(scriptProcessor).connect(context.destination)

  onPitchDetectedCallback.current = new Array(numTotalAudioSamples).fill(0);
    scriptProcessor.addEventListener('audioprocess', function(event) {
      const inputSamples = event.inputBuffer.getChannelData(0);
      for (let i = 0; i < numAudioSamplesPerAnalysis; i++) {
        onPitchDetectedCallback.current[i] = onPitchDetectedCallback.current[i + numAudioSamplesPerAnalysis];
        onPitchDetectedCallback.current[i + 256] = onPitchDetectedCallback.current[i + 512];
        onPitchDetectedCallback.current[i + 512] = onPitchDetectedCallback.current[i + 768];
        onPitchDetectedCallback.current[i + 768] = inputSamples[i];
      }
    })

  return context
}
