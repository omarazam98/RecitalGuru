import React from "react";
import css from "../../css/slides.css";

export default function MusicXML(key, path, toolkit) {
    const setOptions = function () {
      let pixelHeight = window.innerHeight / 2;
      let pixelWidth = window.innerWidth + 25;
      let defaultOptions = {
          pageHeight: pixelHeight  * (100 / 73.5),
          pageWidth:  pixelWidth * (100 / 66.5),
          scale: 66.5,
          adjustPageHeight: true,
          adjustPageWidth: "smart",
          minLastJustification: 0,
          header: 'none',
          footer: 'none',
          breaks: 'auto',
          justifyVertically: true,
          pageMarginLeft: 0,
          defaultLeftMargin: 0,
      };
      toolkit.setOptions({ ...defaultOptions, transpose: key });
    };

    const render = async () => {
      const slides = []
      let max = toolkit.getPageCount();
      for (let i = 1; i <= max; i++) {
        slides.push(
            <div className={"keen-slider__slide"}>
                <section style={css} dangerouslySetInnerHTML={{ __html: toolkit.renderToSVG(i, {}) }}/>
            </div>
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
