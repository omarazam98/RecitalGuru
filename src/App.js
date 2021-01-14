import React, {useCallback, useEffect, useState, useLayoutEffect, useMemo} from 'react';
import {IonPicker, IonContent, IonApp, IonToolbar, IonButtons, IonButton, IonHeader, IonFooter, IonMenu, IonList, IonItem, IonMenuToggle, IonTitle, IonListHeader} from "@ionic/react";
import {IonSlides, IonSlide} from "@ionic/react";

import './App.css';
import '@ionic/react/css/core.css';

import verovio from 'verovio'
import {MidiPlayer} from "./components/Player/MidiPlayer/MidiPlayer";
import RevealMusicXML from "./components/Player/RevealMusicXml/RevealMusicXML";
import {MidiSync, removeHighlights, connectAubioMedia} from "./components/Player/MidiPlayer/MidiFunctions";
import Soundfont from "soundfont-player";
import css from "./css/slidesSimple.css";

const songs = {
    "Senorita": 'https://omarazam98.github.io/MusicXmlData/xmlFiles/Test2.xml',
    "Hallelujah": 'https://omarazam98.github.io/MusicXmlData/xmlFiles/Test8.xml',
    "Viva La Vida": 'https://omarazam98.github.io/MusicXmlData/xmlFiles/Test9.xml',
    "Dance Monkey": 'https://omarazam98.github.io/MusicXmlData/xmlFiles/Test11.xml'
}

function App() {
    const [playing, setPlaying] = useState(false);
    const [player, setPlayer] = useState(null);
    const [instrument, setInstrument] = useState("flute");

    const [micFreq, setMicFreq] = useState(0);
    const [event, setEvent] = useState(0);

    const [slides, setSlides] = useState([]);
    const [toolkit, setToolkit] = useState(null);
    const [path, setPath] = useState("Hallelujah");
    const [data, setData] = useState(null);
    const [timeMap, setTimeMap] = useState(null);
    const [key, setKey] = useState('C');
    const [practice, setPractice] = useState(true);
    const [ac, setAc] = useState(null);

    const [open, setOpen] = useState(false);
    const [swiper, setSwiper] = useState({});

    const [score, setScore] = useState("0%");
    const [notes, setNotes] = useState(0);

    let pNotes = 0;

    const getFirstColumn = {
        name: "First",
        selectedIndex: 0,
        options: [
            { text: "Grand Piano", value: "acoustic_grand_piano" },
            { text: "Acoustic Guitar", value: "acoustic_guitar_nylon" },
            { text: "Electric Guitar", value: "electric_guitar_clean" },
            { text: "Clarinet", value: "clarinet" },
            { text: "Flute", value: "flute" },
            { text: "Alto Sax", value: "alto_sax" },
            { text: "Trumpet", value: "trumpet" },
            { text: "Cello", value: "cello" },
            { text: "Violin", value: "violin" },
        ]

    }

    const getSecondColumn = {
        name: "Second",
        selectedIndex: 0,
        options: [
            { text: "A", value: "A" },
            { text: "B", value: "B" },
            { text: "C", value: "C" },
            { text: "D", value: "D" },
            { text: "E", value: "E" },
            { text: "F", value: "F" },
            { text: "G", value: "G" }
        ]
    };

    const Notes = {
    127: 'G9',
    126: 'F#9/Gb9',
    125: 'F9',
    124: 'E9',
    123: 'D#9/Eb9',
    122: 'D9',
    121: 'C#9/Db9',
    120: 'C9',
    119: 'B8',
    118: 'A#8/Bb8',
    117: 'A8',
    116: 'G#8/Ab8',
    115: 'G8',
    114: 'F#8/Gb8',
    113: 'F8',
    112: 'E8',
    111: 'D#8/Eb8',
    110: 'D8',
    109: 'C#8/Db8',
    108: 'C8',
    107: 'B7',
    106: 'A#7/Bb7',
    105: 'A7',
    104: 'G#7/Ab7',
    103: 'G7',
    102: 'F#7/Gb7',
    101: 'F7',
    100: 'E7',
    99:	'D#7/Eb7',
    98:	'D7',
    97:	'C#7/Db7',
    96:	'C7',
    95:	'B6',
    94:	'A#6/Bb6',
    93:	'A6',
    92:	'G#6/Ab6',
    91:	'G6',
    90:	'F#6/Gb6',
    89:	'F6',
    88:	'E6',
    87:	'D#6/Eb6',
    86:	'D6',
    85:	'C#6/Db6',
    84:	'C6',
    83:	'B5',
    82:	'A#5/Bb5',
    81:	'A5',
    80:	'G#5/Ab5',
    79:	'G5',
    78:	'F#5/Gb5',
    77:	'F5',
    76:	'E5',
    75:	'D#5/Eb5',
    74:	'D5',
    73:	'C#5/Db5',
    72:	'C5',
    71:	'B4',
    70:	'A#4/Bb4',
    69:	'A4',
    68:	'G#4/Ab4',
    67:	'G4',
    66:	'F#4/Gb4',
    65:	'F4',
    64:	'E4',
    63:	'D#4/Eb4',
    62:	'D4',
    61:	'C#4/Db4',
    60: 'C4',
    59:	'B3',
    58:	'A#3/Bb3',
    57:	'A3',
    56:	'G#3/Ab3',
    55:	'G3',
    54:	'F#3/Gb3',
    53:	'F3',
    52:	'E3',
    51:	'D#3/Eb3',
    50:	'D3',
    49:	'C#3/Db3',
    48:	'C3',
    47:	'B2',
    46:	'A#2/Bb2',
    45:	'A2',
    44:	'G#2/Ab2',
    43:	'G2',
    42:	'F#2/Gb2',
    41:	'F2',
    40:	'E2',
    39:	'D#2/Eb2',
    38:	'D2',
    37:	'C#2/Db2',
    36:	'C2',
    35:	'B1',
    34:	'A#1/Bb1',
    33:	'A1',
    32:	'G#1/Ab1',
    31:	'G1',
    30:	'F#1/Gb1',
    29:	'F1',
    28:	'E1',
    27:	'D#1/Eb1',
    26:	'D1',
    25:	'C#1/Db1',
    24:	'C1',
    23:	'B0',
    22:	'A#0/Bb0',
    21:	'A0'
}

    verovio.module.onRuntimeInitialized = function () {
        setToolkit(new verovio.toolkit())

        const AudioContext = window.AudioContext || window.webkitAudioContext || false;
        const ac = new AudioContext();
        setAc(ac);

        connectAubioMedia(ac, (freq) => {
            setMicFreq(freq)
        })
    }

    const update = useCallback((event, freq) => {
        if(player){
            const time = event.tick / player.division
            const vrvMap = timeMap[time]
                if (Math.abs(freq - event.noteNumber) <= 1) {
                    document.getElementById(vrvMap.off).classList.add('passedNote')
                    pNotes++
                    setScore(Math.round(pNotes / notes * 100) + "%")
                } else {
                    document.getElementById(vrvMap.off).classList.add('failedNote')
                }

                if((timeMap[time]['page']) !== swiper.activeIndex){
                    swiper.slideTo(timeMap[time]['page'])
                }
        }
    }, [player])

    const playPause = (p) => {
        ac.resume().then(() => {
            if(p !== practice){
                setPlayer(null)
                setPractice(p)
            }
            setPlaying(!playing)
        })
    }

    useEffect(() => {
            async function render() {
                const slides = await RevealMusicXML(key, songs[path], toolkit)
                const data = await toolkit.renderToMIDI()
                const timeMap = await MidiSync(toolkit)

                setSlides(slides)
                setData(data)
                setTimeMap(timeMap)
            }

            if(toolkit && path && key){
                render().then(() => {
                    setNotes(document.getElementsByClassName('note').length)
                })
            }
    },
    [toolkit, path, key]);

    useEffect(() => {
            if(data && timeMap && ac && instrument){
                setPlayer(null)
                Soundfont.instrument(ac, instrument).then((soundfont) => {
                    removeHighlights();
                    MidiPlayer(ac, soundfont, data, timeMap, practice).then((player) =>{
                        setPlayer(player)
                        player.on('endOfFile' , () => {
                            setPlaying(false)
                            swiper.slideTo(0)
                            removeHighlights();
                            setPractice(!practice)
                        })


                        player.on('midiEvent' , (event) => {
                            if(event.velocity === 0)
                                requestAnimationFrame(() => {
                                    setTimeout(() => {
                                        setEvent(event)
                                    }, 66)
                                })
                        })
                    })
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
            }
        },
        [player, playing]);

    useLayoutEffect(() => {
            update(event, micFreq)
        },
        [event]);



    return (
        <IonApp>
            <IonMenu active={'true'} contentId="content1">
              <IonList id="song" labelId="song" disabled={playing} value={path}>
                  <IonListHeader lines="full">
                      <h2>Select Song</h2>
                  </IonListHeader>
                  {Object.keys(songs).map((key) => {
                      return <IonMenuToggle><IonItem button menuClose onClick={() => setPath(key)}>{key}</IonItem></IonMenuToggle>
                  })}
              </IonList>
            </IonMenu>
            <IonPicker
              mode={"ios"}
              isOpen={open}
              columns={[getFirstColumn, getSecondColumn]}
              buttons={[
                  {
                      text: "Cancel",
                      role: "cancel",
                      handler: value => {setOpen(false)}
                  },
                  {
                      text: "Confirm",
                      handler: value => {
                          setInstrument(value['First'].value);
                          setKey(value["Second"].value);
                          setOpen(false)
                      }
                  }
              ]}>
            </IonPicker>
              <IonHeader>
                  <IonToolbar>
                      <IonButtons slot={"start"}>
                          <IonTitle>Recital Guru</IonTitle>
                          <IonMenuToggle>
                              <IonButton class={"btn2"} id={"content1"} disabled={playing}>Song</IonButton>
                          </IonMenuToggle>
                          <IonButton class={"btn2"} disabled={playing} onClick={ () => setOpen(true)}>Instrument/Key</IonButton>
                      </IonButtons>
                  </IonToolbar>
              </IonHeader>
              <IonFooter>
                  <IonToolbar>
                      <IonButtons slot={"end"}>
                          <IonTitle id={"tuner"}>{Notes[micFreq]}</IonTitle>
                          <IonButton class={"btn"} disabled={!player || playing && practice} onClick={() => playPause(false)}> {playing && !practice ? 'Pause' : 'Free Play'}</IonButton>
                          <IonButton class={"btn"} disabled={!player || playing && !practice}  onClick={() => playPause(true)}>{playing && practice ? 'Pause' : 'Practice'}</IonButton>
                          <IonTitle id={"score"}>Score {score}</IonTitle>
                      </IonButtons>
                  </IonToolbar>
              </IonFooter>
                  <IonContent>
                      <IonSlides key={slides.map(slide => slide.id).join('_')} style={css} options = {{direction: 'vertical', slidesPerView: 2}} onIonSlidesDidLoad={(event) => setSwiper(event.target.swiper)}>
                          {slides.map((slide) => {
                              return (
                                  <IonSlide key={slide.id}> {slide}</IonSlide>
                              )
                          })}
                      </IonSlides>
                  </IonContent>
          </IonApp>
  )
}

export default App;
