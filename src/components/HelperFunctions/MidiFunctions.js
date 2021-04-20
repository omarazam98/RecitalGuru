export const MidiSync = async (toolkit) => {
    const syncedNotes = {}

    const timeMap = await toolkit.renderToTimemap();
    for (let index = 0; index < timeMap.length; index++){
        const noteTime = timeMap[index].qstamp

        if(timeMap[index]['on']){
            const element = document.getElementById(timeMap[index]['on'][0])
            const currentPage = toolkit.getPageWithElement(timeMap[index]['on'][0]) - 1
            const time =  (toolkit.getMIDIValuesForElement(timeMap[index]['on'][0]).duration) / 1000
            syncedNotes[noteTime] = {
                'on' : (style) => requestAnimationFrame(() => element.classList.add(style)),
                'page': currentPage,
                'time' : time,
                'hide' : () => element.style.visibility = 'hidden',
                'show' : () => element.style.visibility = 'visible',
                'classList' : element.classList
            };
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