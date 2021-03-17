import * as Aubio from "../../../aubio/aubio"

export default class PitchNode extends AudioWorkletNode {

  init(onPitchDetectedCallback, numAudioSamplesPerAnalysis) {
    Aubio().then((aubio) => {
      this.pitchDetector = new aubio.Pitch('default', numAudioSamplesPerAnalysis, numAudioSamplesPerAnalysis / 2, this.context.sampleRate);
      this.onPitchDetectedCallback = onPitchDetectedCallback;
      this.numAudioSamplesPerAnalysis = numAudioSamplesPerAnalysis;
      // Listen to messages sent from the audio processor.
      this.port.onmessage = (event) => this.onmessage(event.data);
      this.port.postMessage({
        type: "init",
        sampleRate: this.context.sampleRate,
        numAudioSamplesPerAnalysis: this.numAudioSamplesPerAnalysis,
      });
    })
  }

  // Handle an uncaught exception thrown in the PitchProcessor.
  onprocessorerror(err) {
    console.log(
      `An error from AudioWorkletProcessor.process() occurred: ${err}`
    );
  };

  onmessage(event) {
    if (event.type === "pitch") {
      // A pitch was detected. Invoke our callback which will result in the UI updating.
      this.onPitchDetectedCallback.current = Math.round(12 * (Math.log2(this.pitchDetector.do(event.pitch) / 440)) + 69);
    }
  }
}
