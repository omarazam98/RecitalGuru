import PitchNode from "./PitchNode";

async function getWebAudioMediaStream() {
  if (!window.navigator.mediaDevices) {
    throw new Error(
      "This browser does not support web audio or it is not enabled."
    );
  }

  try {
    const result = await window.navigator.mediaDevices.getUserMedia({audio: {echoCancellationType:'browser', echoCancellation: false, noiseSuppression: false}});

    return result;
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
  const mediaStream = await getWebAudioMediaStream();

  const context = new window.AudioContext({latencyHint: 'interactive'});
  const audioSource = context.createMediaStreamSource(mediaStream);

  let node;

  try {
    const processorUrl = "./RecitalGuru/PitchProcessor.js";
    try {
      await context.audioWorklet.addModule(processorUrl);
    } catch (e) {
      throw new Error(
        `Failed to load audio analyzer worklet at url: ${processorUrl}. Further info: ${e.message}`
      );
    }

    node = new PitchNode(context, "PitchProcessor");

    const numAudioSamplesPerAnalysis = 1024;


    node.init(onPitchDetectedCallback, numAudioSamplesPerAnalysis);

    audioSource.connect(node);

    node.connect(context.destination);

  } catch (err) {
    throw new Error(
      `Failed to load audio analyzer WASM module. Further info: ${err.message}`
    );
  }

  return context
}