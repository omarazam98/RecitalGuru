
const singleHighLight = (className, element) => requestAnimationFrame(() => element.classList.add(className))
const multipleHighlight = (className, elements, totalNotes) => requestAnimationFrame(() => {
    for(let i = 0; i < totalNotes; i++){
        elements[i].classList.add(className)
    }
})

const singleVisibility = (style, element) => requestAnimationFrame(() => element.style.visibility = style)
const multipleVisibility = (style, elements, totalNotes) => requestAnimationFrame(() => {
    for(let i = 0; i < totalNotes; i++) {
        elements[0].style.visibility = style
    }
})

export const MidiSync = async (toolkit, slider) => {
    const syncedNotes = {}
    const timeMap = await toolkit.renderToTimemap();
    let page = 0;

    for (let index = 0; index < timeMap.length; index++){
        if(timeMap[index]['on']){
            const noteTime = timeMap[index].qstamp
            const elementsArr = timeMap[index]['on'];
            const pitch = toolkit.getMIDIValuesForElement(elementsArr[0]).pitch;
            let time = (toolkit.getMIDIValuesForElement(elementsArr[0]).duration) / 1000

            const nextElementsArr = timeMap[index + 1]['on']
            if(nextElementsArr && toolkit.getMIDIValuesForElement(nextElementsArr[0]).pitch === -1){
                elementsArr.push(nextElementsArr)
                time = time + (toolkit.getMIDIValuesForElement(nextElementsArr[0]).duration) / 1000
            }

            const totalNotes = elementsArr.length;
            const elements = elementsArr.map((el) => document.getElementById(el))
            const currentPage = toolkit.getPageWithElement(timeMap[index]['on'][0]) - 1

            let onHighlight;
            if(currentPage > page && totalNotes > 1){
                page = currentPage;
                onHighlight = (className) => {
                    slider.moveToSlideRelative(currentPage);
                    multipleHighlight(className, elements, totalNotes)
                }
            }else if(totalNotes > 1) {
                onHighlight = (className) => {
                    multipleHighlight(className, elements, totalNotes)
                }
            } else if(currentPage > page){
                onHighlight = (className) => {
                    slider.moveToSlideRelative(currentPage);
                    singleHighLight(className, elements[0])
                }
            } else {
                onHighlight = (className) => {
                    singleHighLight(className, elements[0])
                }
            }
            syncedNotes[noteTime] = {
                'page': currentPage,
                'time' : time,
                'pitch': pitch,
                'totalNotes': totalNotes,
                'highlight' : onHighlight,
                'visibility' : totalNotes > 1 ? (style) => multipleVisibility(style, elements, totalNotes) :
                    (style) => singleVisibility(style, elements[0])
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