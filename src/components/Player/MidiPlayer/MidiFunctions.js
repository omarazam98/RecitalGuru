import Reveal from "reveal.js";
import * as Aubio from '../../../aubio/aubio'

let scriptProcessor;
let pitchDetector;

export const connectAubioMedia = (ac, func) => {
    Aubio().then(async (aubio) => {
        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = await function () {
                const getUserMedia =  navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
                if (!getUserMedia) {
                    alert('getUserMedia is not implemented in this browser')
                }
                return new Promise(function (resolve, reject) {
                    getUserMedia.call(navigator, {audio:{echoCancellationType:'browser', echoCancellation: false, noiseSuppression: false, autoGainControl: false}}, resolve, reject)
                })
            }
        }

        if(pitchDetector === undefined){
            pitchDetector = new aubio.Pitch('default', 1024, 1, ac.sampleRate)
        }

        if(scriptProcessor === undefined){
            scriptProcessor = ac.createScriptProcessor(1024, 1, 1)
            const analyser = ac.createAnalyser();
            const stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellationType:'browser', echoCancellation: false, noiseSuppression: false, autoGainControl: false}})

            ac.createMediaStreamSource(stream).connect(analyser)
            analyser.connect(scriptProcessor)
            scriptProcessor.connect(ac.destination)
        }

        scriptProcessor.addEventListener('audioprocess', function(event) {
                func(Math.round(pitchDetector.do(event.inputBuffer.getChannelData(0)) / 5) * 5)
        })
    })
}

export const MidiSync = async (toolkit) => {
    const syncedNotes = {}
    const timeMap = await toolkit.renderToTimemap();
    for (let index = 0; index < timeMap.length; index++){
        const noteTime = timeMap[index].qstamp
        syncedNotes[noteTime] = syncedNotes[noteTime] ? syncedNotes[noteTime] : {on: [], off:[], time: 0}
        if(timeMap[index]['on']){
            syncedNotes[noteTime]['on'].push(...timeMap[index]['on'])
        }
        if(timeMap[index + 1] && timeMap[index + 1]['off']){
            syncedNotes[noteTime]['off'].push(...timeMap[index + 1]['off'])
            syncedNotes[noteTime]['time'] = (toolkit.getMIDIValuesForElement(timeMap[index + 1]['off'][0]).duration) / 1000
        }
    }
    return syncedNotes
}

export const revealInitialize = () => {
    Reveal.initialize({
        controlsTutorial: false,
        navigationMode: 'linear',
        width: '100%',
        height: '100%',
        transition: 'slide',
        transitionSpeed: 'fast',
    })
    resetSlides();
}

export const resetSlides = () => {
    Reveal.slide(0, 0)
}

export const getSlideSize = () => {
    return Reveal.getComputedSlideSize()
}

export const playChangeControls = (player) => {
    Reveal.configure({
        controls: !player.isPlaying()
    });
}

export const removeHighlights = () => {
    document.querySelectorAll('.passedNote').forEach((note) => {
        note.classList.remove('highlightedNote')
        note.classList.remove('passedNote')
    })
    document.querySelectorAll('.failedNote').forEach((note) => {
        note.classList.remove('highlightedNote')
        note.classList.remove('failedNote')
    })
}