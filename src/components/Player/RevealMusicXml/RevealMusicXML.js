import React from "react";
import {getSlideSize} from "../MidiPlayer/MidiFunctions";

export default function RevealMusicXML(key, path, toolkit) {
    const setOptions = function () {
      let size = getSlideSize();
      let pixelHeight = size.height;
      let pixelWidth = size.width;
      let defaultOptions = {
        pageHeight: pixelHeight  * (100 / 60),
        pageWidth:  pixelWidth * (100 / 50),
        scale: 50,
        breaks: 'line',
        adjustPageHeight: true,
        minLastJustification: 0
      };
      toolkit.setOptions({ ...defaultOptions, transpose: key });
    };

    const render = () => {
      const slides = []
      let max = toolkit.getPageCount();
      for (let i = 1; i <= max; i++) {
        slides.push(
            <section
              id={'RevealMusicXML' + i}
              dangerouslySetInnerHTML={{ __html: toolkit.renderToSVG(i, {}) }}
            />
        )
      }
      return (slides)
    };

    const loadExternalMusicXML = (url) => {
        return fetch(url)
          .then(res => {
            if (res.ok) {
                return res.text();
            } else {
                throw new Error('Failed to load ' + url);
            }
          })
          .then(text => {
              setOptions();
              toolkit.loadData(text);
              return render(toolkit);
          })
    };

    return loadExternalMusicXML(path)
}
