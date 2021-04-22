export const MidiSync = async (toolkit) => {
    const syncedNotes = {}

    const timeMap = await toolkit.renderToTimemap();
    for (let index = 0; index < timeMap.length && timeMap[index]['on']; index++){
        const noteTime = timeMap[index].qstamp
        const elementsArr = timeMap[index]['on'];
        let time = (toolkit.getMIDIValuesForElement(elementsArr[0]).duration) / 1000

        const nextElementsArr = timeMap[index + 1]['on']
        if(nextElementsArr && toolkit.getMIDIValuesForElement(nextElementsArr[0]).pitch < 0){
            elementsArr.push(nextElementsArr)
            time = time + (toolkit.getMIDIValuesForElement(nextElementsArr[0]).duration) / 1000
        }

        const totalNotes = elementsArr.length;
        const elements = elementsArr.map((el) => document.getElementById(el))
        const currentPage = toolkit.getPageWithElement(elementsArr[0]) - 1

        const onHighlight = totalNotes > 1 ?
            (className) => requestAnimationFrame(() => elements.forEach((el) => el.classList.add(className)))
            :
            (className) => requestAnimationFrame(() => elements[0].classList.add(className))

        const onVisibility = totalNotes > 1 ?
            (style) => requestAnimationFrame(() => elements.forEach((el) => el.style.visibility = style))
            :
            (style) => requestAnimationFrame(() => elements[0].style.visibility = style)

        syncedNotes[noteTime] = {
            'highlight' : (className) => onHighlight(className),
            'page': currentPage,
            'time' : time,
            'totalNotes': totalNotes,
            'visibility' : (style) => onVisibility(style),
        };

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