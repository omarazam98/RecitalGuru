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
            pitchDetector = new aubio.Pitch('default', 512, 1, ac.sampleRate)
        }

        if(scriptProcessor === undefined){
            scriptProcessor = ac.createScriptProcessor(512, 1, 1)
            const stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellationType:'browser', echoCancellation: false, noiseSuppression: false, autoGainControl: false}})

            ac.createMediaStreamSource(stream).connect(scriptProcessor)
            scriptProcessor.connect(ac.destination)
        }

        let prevFreq = 0;
        scriptProcessor.addEventListener('audioprocess', function(event) {
            const freq =  pitchDetector.do(event.inputBuffer.getChannelData(0)) ? Math.round(12 * (Math.log(pitchDetector.do(event.inputBuffer.getChannelData(0)) / 440) / Math.log(2)) + 69) : prevFreq
            if(freq !== prevFreq){
                prevFreq = freq
                func(freq)
            }
        })
    })
}

export const MidiSync = async (toolkit) => {
    let page = 0;
    const syncedNotes = {}

    const timeMap = await toolkit.renderToTimemap();
    for (let index = 0; index < timeMap.length; index++){
        const noteTime = timeMap[index].qstamp

        syncedNotes[noteTime] = syncedNotes[noteTime] ? syncedNotes[noteTime] : {on: [], off:[], time: 0, page: page}
        if(timeMap[index]['on']){
            syncedNotes[noteTime]['on'] = timeMap[index]['on']
            const currentPage = toolkit.getPageWithElement(timeMap[index]['on'][0]) - 1
            page = currentPage ? currentPage : page
            syncedNotes[noteTime]['page'] = currentPage
            syncedNotes[noteTime]['time'] = (toolkit.getMIDIValuesForElement(timeMap[index]['on'][0]).duration) / 1000
        }
        if(timeMap[index] && timeMap[index]['off']){
            syncedNotes[noteTime]['off'] = timeMap[index]['off']
        }
    }
    return syncedNotes
}

export const removeHighlights = () => {
    document.querySelectorAll('.note').forEach((note) => {
        note.classList.remove('highlightedNote')
        note.classList.remove('passedNote')
        note.classList.remove('failedNote')
    })
}