let scriptProcessor;

export const connectAubioMedia = async (ac, freqRef) => {
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

        if(scriptProcessor === undefined){
            scriptProcessor = ac.createScriptProcessor(1024, 1, 1)
            const stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellationType:'browser', echoCancellation: false, noiseSuppression: false, autoGainControl: false}})

            ac.createMediaStreamSource(stream).connect(scriptProcessor)
            scriptProcessor.connect(ac.destination)
        }

        scriptProcessor.addEventListener('audioprocess', function(event) {
            freqRef.current = event.inputBuffer.getChannelData(0)
        })
}

export const MidiSync = async (toolkit) => {
    let page = 0;
    const syncedNotes = {}

    const timeMap = await toolkit.renderToTimemap();
    for (let index = 0; index < timeMap.length; index++){
        const noteTime = timeMap[index].qstamp

        syncedNotes[noteTime] = syncedNotes[noteTime] ? syncedNotes[noteTime] : {on: [], off:[], time: 0, pitch: 0, page: page}
        if(timeMap[index]['on']){
            syncedNotes[noteTime]['on'] = document.getElementById(timeMap[index]['on'][0]).classList
            const currentPage = toolkit.getPageWithElement(timeMap[index]['on'][0]) - 1
            page = currentPage ? currentPage : page
            syncedNotes[noteTime]['page'] = currentPage
            syncedNotes[noteTime]['time'] = (toolkit.getMIDIValuesForElement(timeMap[index]['on'][0]).duration) / 1000
            syncedNotes[noteTime]['pitch'] = (toolkit.getMIDIValuesForElement(timeMap[index]['on'][0]).pitch)
        }
        if(timeMap[index] && timeMap[index]['off']){
            syncedNotes[noteTime]['off'] = document.getElementById(timeMap[index]['off'][0]).classList
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