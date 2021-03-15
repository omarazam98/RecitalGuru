import React, {useCallback, useEffect, useState, useRef} from 'react';
import {IonPicker, IonContent, IonApp, IonToolbar, IonButtons, IonButton, IonHeader, IonFooter, IonMenu, IonList, IonMenuToggle, IonTitle, IonListHeader, IonItem, IonNote, IonActionSheet, IonToast, IonLabel, IonIcon, IonChip} from "@ionic/react";

import {IonSlides, IonSlide} from "@ionic/react";

import { documentText, musicalNotes, chevronDown, chevronBack, key, pause, play, volumeHigh, refresh , options, musicalNote, book} from 'ionicons/icons';

import {iosEnterAnimation, iosLeaveAnimation} from "./animations/ios";


import './App.css';
import '@ionic/react/css/core.css';

import verovio from 'verovio'
import {MidiPlayer} from "./components/Player/MidiPlayer/MidiPlayer";
import RevealMusicXML from "./components/Player/RevealMusicXml/RevealMusicXML";
import {MidiSync, removeHighlights, connectAubioMedia} from "./components/Player/MidiPlayer/MidiFunctions";
import Soundfont from "soundfont-player";
import css from "./css/slidesSimple.css";
import {setupAudio} from "./components/Player/PitchDetector/setupAudio";

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

    const [expectedNote, setExpectedNote] = useState(<IonIcon icon={musicalNote}/>);
    const [curNote, setCurNote] = useState(<IonIcon icon={musicalNote}/>);
    const [score, setScore] = useState("0%");

    const practice = useRef(false)
    const notes = useRef(0);
    let passedNotes = useRef(0);
    let check = useRef(true);
    let difficulty = useRef(true);


    const [showToast, setShowToast] = useState(false);
    const [timer, setTimer] = useState(5);

    const [showActionSheet, setShowActionSheet] = useState(false);

    const [latestPitch, setLatestPitch] = React.useState(undefined);
    const [audio, setAudio] = React.useState(undefined);
    const [running, setRunning] = React.useState(false);

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
    }

    const update = useCallback((point) => {
        passedNotes.current = passedNotes.current + point
        setScore(Math.round(passedNotes.current / notes.current * 100) + "%")
    }, [])

    const playPause = useCallback((p) => {
            if(player){
                    if (p) {
                        check.current = false;
                        player.pause();
                    } else {
                        player.play();
                    }
            }
        },
        [player]);

    useEffect(() => {
            async function render() {
                const slides = await RevealMusicXML(keys[keyIndex], songs[path].path, toolkit)
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
                        window.onorientationchange = () => {
                            render();
                        }
                    })
                })
            }
    },
    [toolkit, path, keyIndex]);

    useEffect(() => {
            if(data && timeMap && ac){
                console.log(instrumentKey)
                Soundfont.instrument(ac, midiInstruments[instrumentKey]).then((soundfont) => {
                    removeHighlights();
                    setSoundFont(soundfont)
                })
            }
        },
        [instrumentKey, data, timeMap, ac]);

    useEffect(() => {
            if(soundFont && swiper){
                MidiPlayer(ac, soundFont, data, freqRef, practice, swiper, update, timeMap, soundFont, setCurNote, check, setExpectedNote, difficulty).then((player) =>{
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

    useEffect(() => {
        if(swiper && player){
            document.onkeydown = function(e) {
                switch(e.which) {
                    case 38: // up
                        swiper.slidePrev();
                        break;

                    case 40: // down
                        swiper.slideNext();
                        break;
                    case 32:
                        playPause();
                        break;
                    default: return; // exit this handler for other keys
                }
                e.preventDefault(); // prevent the default action (scroll / move caret)
            };
        }
    },[swiper, player])



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
                    text: 'Free Play',
                    icon: volumeHigh,
                    handler: () => {
                        practice.current = false;
                        difficulty.current = false;
                        playPause(playing)
                        setPlaying(!playing)
                    }
                }, {
                    text: 'Practice',
                    icon: play,
                    handler: () => {
                        practice.current = true;
                        difficulty.current = false;
                        setShowToast(true)
                    }
                }, {
                    text: 'Training',
                    icon: book,
                    handler: () => {
                        practice.current = true;
                        difficulty.current = true;
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
                duration={1000}
                position={'middle'}
            />
              <IonHeader>
                  <IonToolbar color={'dark'}>
                      <IonTitle size={'small'} slot={'start'}>
                          RecitalGuru
                      </IonTitle>
                      <IonButtons slot={'end'}>
                          <IonButton fill={'outline'} color={'tertiary'} disabled={playing} onClick={ () => setOpen(true)}>
                              <IonIcon icon={musicalNotes}/>
                              {midiInstruments[instrumentKey]}
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
                              Expected {expectedNote}
                          </IonLabel>
                      </IonChip>
                      <IonChip>
                          <IonLabel color={'warning'}>
                              Actual {curNote}
                          </IonLabel>
                      </IonChip>
                      <IonChip>
                          {latestPitch
                              ? `Latest pitch: ${latestPitch} Hz`
                              : running
                                  ? "Listening..."
                                  : "Paused"}
                      </IonChip>
                      <IonButtons slot={"end"}>
                          {!ac ?
                              <IonButton
                                  onClick={async () => {
                                      setAc(await setupAudio(freqRef));
                                      setRunning(true);
                                  }}
                              >
                                  Start listening
                              </IonButton> :
                              <IonButton
                                  onClick={async () => {
                                      if (running) {
                                          await ac.suspend();
                                          setRunning(ac.state === "running");
                                      } else {
                                          await ac.resume();
                                          setRunning(ac.state === "running");
                                      }
                                  }}
                                  disabled={ac.state !== "running" && ac.state !== "suspended"}
                              >
                                  {running ? 'Disconnect' : 'Connect'}
                              </IonButton>
                          }

                          <IonButton fill={'outline'} color={'primary'} expand="block" onClick={() => {
                              if(playing){
                                  playPause(playing)
                                  setPlaying(!playing)
                              } else {
                                  setShowActionSheet(true)
                              }
                          }}>
                              {playing ? <IonIcon icon={pause}/> : <IonIcon icon={options}/>}

                              {playing ? (' Pause ' + score) : player && player.getCurrentTick() ? (' Resume ' + score) : ' Begin Recital '}
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
