import React, {useEffect, useState} from 'react';
import './App.css';

import verovio from 'verovio'
import {MidiPlayer} from "./components/Player/MidiPlayer/MidiPlayer";
import RevealMusicXML from "./components/Player/RevealMusicXml/RevealMusicXML";

import revealCss from "./css/reveal.css";
import verovioCss from "./css/slidesSimple.css";
import {MidiSync, revealInitialize, resetSlides} from "./components/Player/MidiPlayer/MidiFunctions";

function App() {
    const [slides, setSlides] = useState(<section>Loading...</section>);
    const [toolkit, setToolkit] = useState(null);
    const [path, setPath] = useState("https://omarazam98.github.io/MusicXmlData/xmlFiles/Test3.xml");
    const [instrument, setInstrument] = useState("acoustic_grand_piano");
    const [data, setData] = useState(null);
    const [timeMap, setTimeMap] = useState(null);


    const settings = {transpose: 'C', zoom: 60};

    verovio.module.onRuntimeInitialized = function () {
        const toolkit = new verovio.toolkit()
        setToolkit(toolkit)
    }

    useEffect(() => {
            async function render() {
                const slides = await RevealMusicXML(settings, path, toolkit)
                const data = await toolkit.renderToMIDI()
                const timeMap = await MidiSync(toolkit)
                setSlides(slides)
                setData(data)
                setTimeMap(timeMap)
            }

            if(toolkit){
                render().then(() => resetSlides())
            }else {
                revealInitialize();
            }
    },
    [toolkit, path, instrument]);
  return (
      <div style={{height: '100%', width: '100%' }}>
          <div className={'reveal'} style={revealCss}>
              <div className={'slides'} style={verovioCss}>
                  {slides}
              </div>
              <div className={'reveal-toolbar'}>
                  <span className={'reveal-toolbar-button'}>
                      Song:
                      <select className={'reveal-toolbar-button'} value={path} onChange={(event) => setPath(event.target.value)}>
                      <option value={"https://omarazam98.github.io/MusicXmlData/xmlFiles/Test2.xml"}>Senorita</option>
                      <option value={"https://omarazam98.github.io/MusicXmlData/xmlFiles/Test3.xml"}>Little lamb</option>
                  </select>
                  </span>
                  <span className={'reveal-toolbar-button'}>
                      Instrument:
                      <select className={'reveal-toolbar-button'} value={instrument} onChange={(event) => setInstrument(event.target.value)}>
                          <option value={"acoustic_grand_piano"}>Grand Piano</option>
                          <option value={"acoustic_guitar_nylon"}>Acoustic Guitar</option>
                          <option value={"electric_guitar_clean"}>Electric Guitar</option>
                          <option value={"clarinet"}>Clarinet</option>
                          <option value={"flute"}>Flute</option>
                          <option value={"alto_sax"}>Alto Sax</option>
                          <option value={"trumpet"}>Trumpet</option>
                          <option value={"cello"}>Cello</option>
                          <option value={"violin"}>Violin</option>
                      </select>
                  </span>
                  <span className={'reveal-toolbar-button'} id={"score"}/>
                  {MidiPlayer(instrument, data, timeMap)}
                  <span className={'reveal-toolbar-button'} id={"tuner"}/>
              </div>
          </div>
      </div>
  )
}

export default App;
