import React, {useEffect, useMemo, useState} from 'react';
import './App.css';

import verovio from 'verovio'
import {MidiPlayer} from "./components/Player/MidiPlayer/MidiPlayer";
import RevealMusicXML from "./components/Player/RevealMusicXml/RevealMusicXML";
import revealCss from "./css/reveal.css";
import verovioCss from "./css/slidesSimple.css";
import {
    MidiSync,
    revealInitialize,
    resetSlides,
    playChangeControls,
    removeHighlights,
} from "./components/Player/MidiPlayer/MidiFunctions";

import {Box, Button, ButtonGroup} from '@material-ui/core'
import {grey} from "@material-ui/core/colors/grey";
import Soundfont from "soundfont-player";

function App() {
    const [playing, setPlaying] = useState(false);
    const [player, setPlayer] = useState(null);
    const [instrument, setInstrument] = useState("acoustic_grand_piano");

    const [slides, setSlides] = useState(<section>Loading...</section>);
    const [toolkit, setToolkit] = useState(null);
    const [path, setPath] = useState("https://omarazam98.github.io/MusicXmlData/xmlFiles/Test3.xml");
    const [data, setData] = useState(null);
    const [timeMap, setTimeMap] = useState(null);
    const [key, setKey] = useState('C');

    const [practice, setPractice] = useState(true);
    const [ac, setAc] = useState(null);


    const height = document.height < document.width ? document.height : document.width
    const width = document.width > document.height ? document.width : document.height

    verovio.module.onRuntimeInitialized = function () {
        setToolkit(new verovio.toolkit())
        if(window.confirm("Welcome to the RecitalGuru Beta!\n\nSelect a song and the key of your instrument to begin. Notes will be highlighted as you play along providing you with feedback on your performance. If you wish to just listen try the Free Play mode.\n\nRecitalGuru requires a device with a microphone and speakers. Mobile support coming soon")){
            const AudioContext = window.AudioContext || window.webkitAudioContext || false;
            const ac = new AudioContext();
            setAc(ac);
        }
    }

    const playPause = (p) => {
        if(p !== practice){
            setPlayer(null)
            setPractice(p)
        }

        setPlaying(!playing)
    }

    useEffect(() => {
            async function render() {
                const slides = await RevealMusicXML(key, path, toolkit)
                const data = await toolkit.renderToMIDI()
                const timeMap = await MidiSync(toolkit)
                setSlides(slides)
                setData(data)
                setTimeMap(timeMap)
            }

            if(toolkit && path && key){
                render().then(() => resetSlides())
            }else {
                revealInitialize();
            }
    },
    [toolkit, path, key]);

    useEffect(() => {
            if(data && timeMap && ac && instrument){
                Soundfont.instrument(ac, instrument).then((soundfont) => {
                    removeHighlights();
                    setPlayer(MidiPlayer(ac, soundfont, data, timeMap, practice))
                })
            }
        },
        [instrument, data, timeMap, ac, practice]);

    useEffect(() => {
            if(player){
                if (!playing) {
                    player.pause();
                    if(!window.safari)
                        player.instrument.stop(ac.currentTime)
                } else {
                    player.play();
                }
                playChangeControls(player);
            }
        },
        [player, playing]);


  return (
      <div style={{height: height, width: width }}>
          <div className={'reveal'} style={revealCss}>
              <div className={'slides'} style={verovioCss}>
                  {slides}
              </div>
              <div className={'reveal-toolbar'}>
                  <span className={'reveal-toolbar-button'}>
                      Song
                      <select disabled={playing} className={'reveal-toolbar-button'} value={path} onChange={(event) => setPath(event.target.value)}>
                      <option value={"https://omarazam98.github.io/MusicXmlData/xmlFiles/Test2.xml"}>Senorita</option>
                      <option value={"https://omarazam98.github.io/MusicXmlData/xmlFiles/Test3.xml"}>Little lamb</option>
                  </select>
                  </span>
                  <span className={'reveal-toolbar-button'}>
                      Key
                      <select disabled={playing} className={'reveal-toolbar-button'} value={key} onChange={(event) => setKey(event.target.value)}>
                      <option value={"A"}>A</option>
                      <option value={"C"}>C</option>
                      <option value={"D"}>D</option>
                      <option value={"E"}>E</option>
                      <option value={"E"}>Eb</option>
                      <option value={"G"}>G</option>
                      </select>
                  </span>
                  <span className={'reveal-toolbar-button'}>
                      Instrument
                      <select disabled={playing} className={'reveal-toolbar-button'} value={instrument} onChange={(event) => setInstrument(event.target.value)}>
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
                  <ButtonGroup disableElevation variant="contained" color="primary">
                      <Button disabled={!player || playing && practice} onClick={() => playPause(false)}> {playing && !practice ? 'Pause' : 'Free Play'}</Button>
                      <Button disabled={!player || playing && !practice}  onClick={() => playPause(true)}>{playing && practice ? 'Pause' : 'Practice'}</Button>
                  </ButtonGroup>
                  <Box className={'reveal-toolbar-button'} bgcolor={grey}>
                      <div id={"score"}/>
                      <div id={"tuner"}/>
                  </Box>
              </div>
          </div>
      </div>
  )
}

export default App;
