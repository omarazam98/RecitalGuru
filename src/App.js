import React, {useCallback, useEffect, useState, useRef} from 'react';
import {IonPicker, IonContent, IonApp, IonToolbar, IonButtons, IonButton, IonHeader, IonFooter, IonMenu, IonList, IonMenuToggle, IonListHeader, IonItem, IonActionSheet, IonToast, IonLabel, IonIcon, IonChip} from "@ionic/react";

import {IonSlides, IonSlide} from "@ionic/react";

import { documentText, musicalNotes, chevronDown, chevronBack, key, pause, play, volumeHigh, refresh , options, musicalNote, book, accessibility, close, time} from 'ionicons/icons';

import {iosEnterAnimation, iosLeaveAnimation} from "./animations/ios";


import './App.css';
import '@ionic/react/css/core.css';

import verovio from 'verovio'
import {MidiPlayer} from "./components/MidiPlayer/MidiPlayer";
import MusicXML from "./components/MusicXml/MusicXML";
import {MidiSync, removeHighlights} from "./components/HelperFunctions/MidiFunctions";
import Soundfont from "soundfont-player";
import css from "./css/slidesSimple.css";
import {setupAudio} from "./components/PitchDetector/setupAudio";

const songs = {
    0 : { path: 'https://omarazam98.github.io/MusicXmlData/xmlFiles/Test2.xml', name: 'Senorita'},
    1 : {path: 'https://omarazam98.github.io/MusicXmlData/xmlFiles/Test8.xml', name: 'Hallelujah'},
    2 : {path: 'https://omarazam98.github.io/MusicXmlData/xmlFiles/Test9.xml', name: 'Viva La Vida'},
    3 : { path: 'https://omarazam98.github.io/MusicXmlData/xmlFiles/Test11.xml' , name: 'Dance Monkey'}
}

function App() {
    const [playing, setPlaying] = useState(false);
    const [player, setPlayer] = useState(null);

    const [soundFont, setSoundFont] = useState(null);
    const [instrumentKey, setInstrumentKey] = useState(0);

    const freqRef = useRef(0);

    const [slides, setSlides] = useState([]);
    const [toolkit, setToolkit] = useState(null);
    const [path, setPath] = useState(1);
    const [data, setData] = useState(null);
    const [timeMap, setTimeMap] = useState(null);
    const [keyIndex, setKeyIndex] = useState(2);
    const [ac, setAc] = useState(null);

    const [open, setOpen] = useState(false);
    const [swiper, setSwiper] = useState({});

    const [expectedNote, setExpectedNote] = useState('');
    const [curNote, setCurNote] = useState('');
    const [score, setScore] = useState("0%");

    const practice = useRef(false)
    const notes = useRef(0);
    let passedNotes = useRef(0);
    let check = useRef(true);

    const [showToast, setShowToast] = useState(false);
    const [timer, setTimer] = useState(5);

    const [showActionSheet, setShowActionSheet] = useState(false);

    const [completed, setCompleted] = useState(false);


    let mode = useRef("listen");

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

    const instruments = {
        0: 'Piano',
        1: 'Guitar',
        2: 'Clarinet',
        3: 'Flute',
        4: 'Sax',
        5: 'Trumpet',
        6: 'Cello',
        7: 'Violin'
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
    }

    const update = useCallback((point) => {
        passedNotes.current = passedNotes.current + point
        setScore(Math.round(passedNotes.current / notes.current * 100) + "%")
    }, [])

    const playPause = useCallback(async (p) => {
            if(player){
                    if (p) {
                        check.current = false;
                        setPlaying(false)
                        player.pause();
                        await ac.suspend();
                    } else {
                        await ac.resume();
                        player.play();
                    }
            }
        },
        [player]);

    const render = async function render() {
        const slides = await MusicXML(keys[keyIndex], songs[path].path, toolkit)
        const data = await toolkit.renderToMIDI()

        setSlides(slides)
        setData(data)
    }

    window.onorientationchange = () => {
        if(!playing && toolkit){
            render().then(() => {
                MidiSync(toolkit).then((map) => {
                    setTimeMap(map)
                })
            });
        }
    }

    useEffect(() => {
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
            if(data && timeMap && ac){
                Soundfont.instrument(ac, midiInstruments[instrumentKey]).then((soundfont) => {
                    removeHighlights();
                    setSoundFont(soundfont)
                })
            }
        },
        [instrumentKey, data, timeMap, ac]);

    useEffect(() => {
            if(soundFont && swiper){
                setCompleted(false)
                MidiPlayer(ac, soundFont, data, freqRef, practice, swiper, update, timeMap, soundFont, setCurNote, check, setExpectedNote, mode).then((player) =>{
                    setPlayer(player)
                    player.on('endOfFile' , () => {
                        setPlaying(false)
                        setCompleted(true)
                        swiper.slideTo(0)
                    })
                })
            }
        },
        [soundFont, swiper]);

    useEffect(() => {
        if(swiper){
            document.onkeydown = function(e) {
                switch(e.which) {
                    case 38: // up
                        swiper.slidePrev();
                        break;
                    case 40: // down
                        swiper.slideNext();
                        break;
                    default: return; // exit this handler for other keys
                }
                e.preventDefault(); // prevent the default action (scroll / move caret)
            };
        }
    },[swiper])



    return (
        <IonApp>
            <IonMenu active={'true'} contentId="content1" side={'end'}>
              <IonList mode={'ios'} id="song" labelId="song" disabled={playing} value={path}>
                  <IonListHeader lines="full">
                      <h2>Select Song</h2>
                  </IonListHeader>
                  {Object.keys(songs).map((key) => {
                      return <IonMenuToggle><IonItem button menuClose onClick={() => setPath(key)}>{songs[key].name}</IonItem></IonMenuToggle>
                  })}
              </IonList>
            </IonMenu>
            <IonPicker
                mode={'ios'}
              isOpen={open}
              columns={[getFirstColumn, getSecondColumn]}
              enterAnimation={(baseEl) => iosEnterAnimation(baseEl)}
              leaveAnimation={(baseEl) => iosLeaveAnimation(baseEl)}
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
            <IonActionSheet
                cssClass={"custom-class"}
                mode={"ios"}
                isOpen={showActionSheet}
                onDidDismiss={() => setShowActionSheet(false)}
                buttons={[{
                    text: 'Listen',
                    icon: volumeHigh,
                    handler: () => {
                        mode.current = 'listen';
                        playPause(playing)
                        setPlaying(!playing)
                    }
                }, {
                    text: 'Practice',
                    icon: time,
                    handler: () => {
                        mode.current = 'practice';
                        setShowToast(true)
                    }
                }, {
                    text: 'Training',
                    icon: book,
                    handler: () => {
                        mode.current = 'training';
                        setShowToast(true)
                    }
                }, {
                    text: 'Free Play',
                    icon: play,
                    handler: () => {
                        mode.current = 'free play';
                        setShowToast(true)
                    }
                }, {
                    text: 'Accessibility',
                    icon: accessibility,
                    handler: () => {
                        mode.current = 'accessibility';
                        setShowToast(true)
                    }
                }, {
                    text: 'Reset',
                    icon: refresh,
                    handler: () => {
                        player.resetTracks()
                        player.skipToSeconds(0)
                        removeHighlights()
                        setScore('0%')
                        passedNotes.current = 0;
                        swiper.slideTo(0);
                    }
                }, {
                    text: 'Cancel',
                    role: 'cancel',
                    icon: close,
                    handler: () => {}
                }]}
                />
            <IonToast
                cssClass={'toast'}
                isOpen={showToast}
                onDidDismiss={() => {
                    setShowToast(false)
                    if(timer > 1){
                        setTimer(timer - 1)
                        setShowToast(true)
                    } else {
                        setTimer(5)
                        playPause(playing)
                        setPlaying(!playing)
                    }
                }}
                message= {timer}
                duration={100}
                position={'middle'}
            />
              <IonHeader>
                  <IonToolbar color={'dark'}>
                      <IonLabel slot={'start'}>
                          <img className="header1" src="https://omarazam98.github.io/MusicXmlData/img/logo.png"/>
                      </IonLabel>
                      <IonButtons slot={'end'}>
                          <IonButton fill={'outline'} color={'tertiary'} disabled={playing} onClick={ () => setOpen(true)}>
                              <IonIcon icon={musicalNotes}/>
                              {instruments[instrumentKey]}
                              <IonIcon icon={key}/>
                              {keys[keyIndex]}
                              <IonIcon icon={chevronDown}/>
                          </IonButton>
                          <IonMenuToggle>
                              <IonButton fill={'outline'} color={'tertiary'} id={"content1"} disabled={playing}>
                                  <IonIcon icon={documentText}/>
                                  {songs[path].name}
                                  <IonIcon icon={chevronBack}/>
                              </IonButton>
                          </IonMenuToggle>
                      </IonButtons>
                  </IonToolbar>
              </IonHeader>
              <IonFooter >
                  <IonToolbar color={"dark"}>
                      <IonChip>
                          <IonLabel color={'success'}>
                              Expected {playing ? expectedNote : <IonIcon icon={musicalNote}/>}
                          </IonLabel>
                      </IonChip>
                      <IonChip>
                          <IonLabel color={'warning'}>
                              Actual {playing ? curNote : <IonIcon icon={musicalNote}/>}
                          </IonLabel>
                      </IonChip>
                      <IonButtons slot={"end"}>
                          <IonButton fill={'outline'} color={'primary'} expand="block" onClick={async () => {
                              if(!ac){
                                  setAc(await setupAudio(freqRef));
                                  setShowActionSheet(true)
                              } else if (completed){
                                  swiper.slideTo(0)
                                  setCompleted(false)
                                  removeHighlights();
                                  setScore('0%')
                                  passedNotes.current = 0;
                                  setShowActionSheet(true)
                              } else if(playing){
                                  playPause(playing)
                                  setPlaying(!playing)
                              } else {
                                  setShowActionSheet(true)
                              }
                          }}>
                              {playing ? <IonIcon icon={pause}/> : <IonIcon icon={options}/>}

                              {playing ? (' Pause ' + score) : player && player.getCurrentTick() && !completed ? ' Resume ' + score : completed ? ' Retry ' + score : ' Begin Recital '}
                          </IonButton>
                      </IonButtons>
                  </IonToolbar>
              </IonFooter>
                  <IonContent>
                      <IonSlides scrollbar={true} key={slides.map(slide => slide.id).join('_')} style={css} options = {{direction: 'vertical', slidesPerView: 2}} onIonSlidesDidLoad={(event) => setSwiper(event.target.swiper)}>
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
