class PitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.samples = [];
    this.totalSamples = 0;

    this.port.onmessage = (event) => this.onmessage(event.data);
  }

  onmessage(event) {
    if (event.type === 'init') {
      const { numAudioSamplesPerAnalysis } = event;

      this.numAudioSamplesPerAnalysis = numAudioSamplesPerAnalysis;

      this.samples = new Array(numAudioSamplesPerAnalysis).fill(0);
      this.totalSamples = 0;
    }
  };

  process(inputs, outputs) {

    const inputChannels = inputs[0];

    const inputSamples = inputChannels[0];

    const numNewSamples = inputSamples.length;
    const numExistingSamples = this.samples.length - numNewSamples;
    for (let i = 0; i < numExistingSamples; i++) {
      this.samples[i] = this.samples[i + numNewSamples];
    }

    for (let i = 0; i < numNewSamples; i++) {
      this.samples[numExistingSamples + i] = inputSamples[i];
    }

    this.totalSamples += inputSamples.length;

    if(this.totalSamples >= this.numAudioSamplesPerAnalysis){
      this.port.postMessage({ type: "pitch", pitch: this.samples });
    }

    return true;
  }
}

registerProcessor("PitchProcessor", PitchProcessor);
