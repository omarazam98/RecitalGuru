import React from 'react'

export const MidiSync = async (toolkit) => {
    let page = 0;
    const syncedNotes = {}

    const timeMap = await toolkit.renderToTimemap();
    for (let index = 0; index < timeMap.length; index++){
        const noteTime = timeMap[index].qstamp

        syncedNotes[noteTime] = syncedNotes[noteTime] ? syncedNotes[noteTime] : {on: [], off:[], time: 0, pitch: 0, page: page}
        if(timeMap[index]['on']){
            const label = document.createElementNS('http://www.w3.org/2000/svg','text');
            label.setAttribute('fill','orange');
            label.setAttribute('width','200');
            label.setAttribute('height','200');
            label.setAttribute('float', 'left')
            const element = document.getElementById(timeMap[index]['on'][0])

            element.appendChild(label)

            syncedNotes[noteTime]['on'] = element.classList
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
        note.classList.remove('semiPassedNote')
    })
}