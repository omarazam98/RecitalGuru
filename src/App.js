import React, {useCallback, useEffect, useState} from 'react';
import {IonPicker, IonContent, IonApp, IonToolbar, IonButtons, IonButton, IonHeader, IonMenu, IonList, IonItem, IonMenuToggle, IonTitle} from "@ionic/react";
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

    const [score, setScore] = useState("0 %");
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

    verovio.module.onRuntimeInitialized = function () {
        setToolkit(new verovio.toolkit())

        const AudioContext = window.AudioContext || window.webkitAudioContext || false;
        const ac = new AudioContext();
        setAc(ac);

        connectAubioMedia(ac, (freq) => {
            if(freq){
                setMicFreq(Math.round(12 * (Math.log(freq / 440) / Math.log(2)) + 69))
            }
        })

    }

    const update = useCallback((event, freq) => {
        if(player){
            const time = event.tick / player.division
            const vrvMap = timeMap[time]
                if (Math.abs(freq - event.noteNumber) <= 1) {
                    document.getElementById(vrvMap.off).classList.add('passedNote')
                    pNotes++
                    setScore(Math.round(pNotes / notes * 100) + " %")
                } else {
                    document.getElementById(vrvMap.off).classList.add('failedNote')
                }

                if((timeMap[time]['page']) !== swiper.activeIndex){
                    console.log((timeMap[time]['page']))
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
                                setTimeout(() => {
                                    setEvent(event)
                                }, 50)
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

    useEffect(() => {
        update(event, micFreq)
        },
        [event]);



    return (
      <div>
          <IonApp>
          <IonMenu active={'true'} contentId="content1">
              <IonList id="song" labelId="song" disabled={playing} value={path}>
                  {Object.keys(songs).map((key) => {
                      return <IonMenuToggle><IonItem button menuClose onClick={() => setPath(key)}>{key}</IonItem></IonMenuToggle>
                  })}
              </IonList>
          </IonMenu>
          <IonPicker
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
                                  <IonButton class={"btn2"} id={"content1"} disabled={playing}>Change Song</IonButton>
                              </IonMenuToggle>
                              <IonButton class={"btn2"} disabled={playing} onClick={ () => setOpen(true)}>Change Instrument/Key</IonButton>
                          </IonButtons>
                          <IonButtons slot={"end"}>
                              <IonButton class={"btn"} disabled={!player || playing && practice} onClick={() => playPause(false)}> {playing && !practice ? 'Pause' : 'Free Play'}</IonButton>
                              <IonButton class={"btn"} disabled={!player || playing && !practice}  onClick={() => playPause(true)}>{playing && practice ? 'Pause' : 'Practice'}</IonButton>
                              <IonTitle id={"tuner"}>{micFreq + "Hz"}</IonTitle>
                              <IonTitle id={"score"}>Score {score}</IonTitle>
                          </IonButtons>
                      </IonToolbar>
                  </IonHeader>
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
      </div>
  )
}

export default App;
