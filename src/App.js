import React, {useCallback, useEffect, useState, useLayoutEffect, useRef, useMemo} from 'react';
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

    const [soundFont, setSoundFont] = useState(null);
    const [instrument, setInstrument] = useState("flute");

    const freqRef = useRef(0);

    const [slides, setSlides] = useState([]);
    const [toolkit, setToolkit] = useState(null);
    const [path, setPath] = useState("Hallelujah");
    const [data, setData] = useState(null);
    const [timeMap, setTimeMap] = useState(null);
    const [key, setKey] = useState('C');
    const practice = useRef(true)
    const [ac, setAc] = useState(null);

    const [open, setOpen] = useState(false);
    const [swiper, setSwiper] = useState({});

    const [curNote, setCurNote] = useState(0);
    const [score, setScore] = useState("0%");

    const notes = useRef(0);
    let passedNotes = useRef(0);
    let check = useRef(false);

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

    verovio.module.onRuntimeInitialized = function () {
        setToolkit(new verovio.toolkit())

        const AudioContext = window.AudioContext || window.webkitAudioContext || false;
        const ac = new AudioContext();
        setAc(ac);

        connectAubioMedia(ac, freqRef)
    }

    const update = useCallback(() => {
        passedNotes.current++
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
                const slides = await RevealMusicXML(key, songs[path], toolkit)
                const data = await toolkit.renderToMIDI()
                const timeMap = await MidiSync(toolkit)

                setSlides(slides)
                setData(data)
                setTimeMap(timeMap)
            }

            if(toolkit && path && key){
                render().then(() => {
                    notes.current = document.getElementsByClassName('note').length
                })
            }
    },
    [toolkit, path, key]);

    useEffect(() => {
            if(data && timeMap && ac && instrument){
                Soundfont.instrument(ac, instrument).then((soundfont) => {
                    removeHighlights();
                    setSoundFont(soundfont)
                })
            }
        },
        [instrument, data, timeMap, ac]);

    useMemo(() => {
            if(soundFont && swiper){
                MidiPlayer(ac, soundFont, data, freqRef, practice, swiper, update, timeMap, soundFont, setCurNote, check).then((player) =>{
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
                          <IonTitle id={"tuner"}>{curNote}</IonTitle>
                          <IonButton class={"btn"} disabled={!player || playing && practice.current} onClick={() => playPause(false)}> {playing && !practice.current ? 'Pause' : 'Free Play'}</IonButton>
                          <IonButton class={"btn"} disabled={!player || playing && !practice.current}  onClick={() => playPause(true)}>{playing && practice.current ? 'Pause' : 'Practice'}</IonButton>
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
