import React, {useCallback, useEffect, useState, useRef, useMemo} from 'react';
import {IonPicker, IonContent, IonApp, IonToolbar, IonButtons, IonButton, IonHeader, IonFooter, IonMenu, IonList, IonMenuToggle, IonTitle, IonListHeader, IonItem, IonNote, IonChip} from "@ionic/react";

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

    const [soundFont, setSoundFont] = useState(null);
    const [instrumentKey, setInstrumentKey] = useState(3);

    const freqRef = useRef(0);

    const [slides, setSlides] = useState([]);
    const [toolkit, setToolkit] = useState(null);
    const [path, setPath] = useState("Hallelujah");
    const [data, setData] = useState(null);
    const [timeMap, setTimeMap] = useState(null);
    const [keyIndex, setKeyIndex] = useState(2);
    const [ac, setAc] = useState(null);

    const [open, setOpen] = useState(false);
    const [swiper, setSwiper] = useState({});

    const [expectedNote, setExpectedNote] = useState("N/A");
    const [curNote, setCurNote] = useState("N/A");
    const [score, setScore] = useState("0%");

    const practice = useRef(true)
    const notes = useRef(0);
    let passedNotes = useRef(0);
    let check = useRef(true);

    const keys = {
        0: 'A',
        1: 'B',
        2: 'C',
        3: 'D',
        4: 'E',
        5: 'F',
        6: 'G'
    }

    const midiInstruments = {
        0: 'acoustic_grand_piano',
        1: 'acoustic_guitar_nylon',
        2: 'clarinet',
        3: 'flute',
        4: 'alto_sax',
        5: 'trumpet',
        6: 'cello',
        7: 'violin'
    }

    const getFirstColumn = {
        name: "First",
        selectedIndex: instrumentKey,
        prefix: 'Instrument: ',
        options: [
            { text: "Piano", value: 0 },
            { text: "Guitar", value: 1 },
            { text: "Clarinet", value: 2 },
            { text: "Flute", value: 3 },
            { text: "Alto Sax", value: 4 },
            { text: "Trumpet", value: 5 },
            { text: "Cello", value: 6 },
            { text: "Violin", value: 7 },
        ]

    }

    const getSecondColumn = {
        name: "Second",
        selectedIndex: keyIndex,
        prefix: 'Key: ',
        options: [
            { text: "A", value: 0 },
            { text: "B", value: 1 },
            { text: "C", value: 2 },
            { text: "D", value: 3 },
            { text: "E", value: 4 },
            { text: "F", value: 5 },
            { text: "G", value: 6 }
        ]
    };

    verovio.module.onRuntimeInitialized = function () {
        setToolkit(new verovio.toolkit())

        const AudioContext = window.AudioContext || window.webkitAudioContext || false;
        const ac = new AudioContext();
        setAc(ac);

        connectAubioMedia(ac, freqRef, check)
    }

    const update = useCallback((point) => {
        passedNotes.current = passedNotes.current + point
        setScore(Math.round(passedNotes.current / notes.current * 100) + "%")
    }, [])

    const playPause = useCallback((p) => {
            if(player){
                practice.current = p;
                ac.resume().then(() => {
                    if (player.isPlaying()) {
                        setPlaying(false)
                        player.pause();
                    } else {
                        setPlaying(true)
                        player.play();
                    }
                })
            }
        },
        [player]);

    useEffect(() => {
            async function render() {
                const slides = await RevealMusicXML(keys[keyIndex], songs[path], toolkit)
                const data = await toolkit.renderToMIDI()

                setSlides(slides)
                setData(data)
            }

            if(toolkit && path && keyIndex){
                render().then(() => {
                    passedNotes.current = 0;
                    setScore('0%')
                    notes.current = document.getElementsByClassName('note').length
                    MidiSync(toolkit).then((map) => {
                        setTimeMap(map)
                    })
                })
            }
    },
    [toolkit, path, keyIndex]);

    useEffect(() => {
            if(data && timeMap && ac && instrumentKey){
                Soundfont.instrument(ac, midiInstruments[instrumentKey]).then((soundfont) => {
                    removeHighlights();
                    setSoundFont(soundfont)
                })
            }
        },
        [instrumentKey, data, timeMap, ac]);

    useEffect(() => {
            if(soundFont && swiper){
                MidiPlayer(ac, soundFont, data, freqRef, practice, swiper, update, timeMap, soundFont, setCurNote, check, setExpectedNote).then((player) =>{
                    setPlayer(player)
                    player.on('endOfFile' , () => {
                        setPlaying(false)
                        swiper.slideTo(0)
                        removeHighlights();
                        passedNotes.current = 0;
                    })
                })
            }
        },
        [soundFont, swiper]);



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
                          setInstrumentKey(value['First'].value);
                          setKeyIndex(value["Second"].value);
                          setOpen(false)
                      }
                  }
              ]}>
            </IonPicker>
              <IonHeader>
                  <IonToolbar>
                      <IonButtons slot={"start"}>
                          <IonTitle>Recital Guru</IonTitle>
                          <IonButton fill={'outline'} class={"btn2"} disabled={playing} onClick={ () => setOpen(true)}>Instrument/Key</IonButton>
                          <IonMenuToggle>
                              <IonButton fill={'outline'} class={"btn2"} id={"content1"} disabled={playing}>Song</IonButton>
                          </IonMenuToggle>
                      </IonButtons>
                      <IonTitle slot={'end'}>
                          Score
                          <IonChip>

                              {score}
                          </IonChip>
                      </IonTitle>
                  </IonToolbar>
              </IonHeader>
              <IonFooter>
                  <IonToolbar>
                      <IonItem>
                          <IonNote slot={'start'}>
                              Actual Note
                              <IonChip>
                                  {curNote}
                              </IonChip>
                          </IonNote>
                          <IonNote slot={'start'}>
                              <IonChip>
                                  {expectedNote}
                              </IonChip>
                              Expected Note
                          </IonNote>
                      </IonItem>
                      <IonButtons slot={"end"}>
                          <IonButton fill={'outline'} class={"btn"} disabled={!player || playing && practice.current} onClick={() => playPause(false)}> {playing && !practice.current ? 'Pause' : 'Free Play'}</IonButton>
                          <IonButton fill={'outline'}  class={"btn"} disabled={!player || playing && !practice.current}  onClick={() => playPause(true)}>{playing && practice.current ? 'Pause' : 'Practice'}</IonButton>
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
