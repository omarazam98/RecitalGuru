import Soundfont from 'soundfont-player'
import MidiPlayerJs from 'midi-player-js'
import {connectAubioMedia, playChangeControls} from "./MidiFunctions";
import React, {useEffect, useState} from "react";
import {Button, Switch} from "@material-ui/core";

export const MidiPlayer = (instrument, data, timeMap, playing, setPlaying) => {
    const [player, setPlayer] = useState(null);
    const [ac, setAc] = useState(null);
    const [practice, setPractice] = useState(true);

    let soundfont = null
    let micFreq = 0;
    let totalNotes = document.getElementsByClassName('note').length
    let passedNotes = 0;

    const tuner = document.getElementById('tuner')
    const score = document.getElementById('score')

    const connectMic = () => {
        const AudioContext = window.AudioContext || window.webkitAudioContext || false;
        const context = new AudioContext();
        setAc(context)
    }

    const removeHighlights = () => {
        document.querySelectorAll('.passedNote').forEach((note) => {
            note.classList.remove('highlightedNote')
            note.classList.remove('passedNote')
        })
        document.querySelectorAll('.failedNote').forEach((note) => {
            note.classList.remove('highlightedNote')
            note.classList.remove('failedNote')
        })
    }

    const playPause = () => {
        ac.resume().then(() => {
            if (player.isPlaying()) {
                player.pause();
                if(!window.safari)
                player.instrument.stop(ac.currentTime)
            } else {
                player.play();
            }
            playChangeControls(player);
            setPlaying(player.isPlaying())
        })
    }

    const initializePlayer = async () => {
        const Player = await Soundfont.instrument(ac, instrument).then(function (instrument) {
            let notes = {};
            soundfont = instrument;
            // eslint-disable-next-line react-hooks/exhaustive-deps
            return new MidiPlayerJs.Player(function (event) {
                const time = event.tick / Player.division
                const vrvMap = timeMap[time]

                if (event.velocity > 0) {
                    if(practice){
                        notes[event.noteNumber] = instrument.play(event.noteName, ac.currentTime, {
                            gain: 1,
                            format: 'ogg',
                            notes: event.noteNumber
                        })
                    }

                    const startTime = ac.currentTime
                    const interval = setInterval(() => {
                        if (Math.abs(micFreq - event.noteNumber) <= 1) {
                            vrvMap.off.forEach((note) => {
                                document.getElementById(note).classList.add('passedNote')
                                passedNotes++
                            })
                            clearInterval(interval);
                        } else if ((ac.currentTime - startTime) > vrvMap.time) {
                            vrvMap.off.forEach((note) => {
                                document.getElementById(note).classList.add('failedNote')
                            })
                            clearInterval(interval);
                        }
                        score.innerHTML = Math.round((passedNotes) / totalNotes * 1000) / 10 + ' %'
                    }, 225)

                    vrvMap.on.forEach((note) => {
                        document.getElementById(note).classList.add('highlightedNote')
                    })

                } else if (event.velocity === 0) {
                    event.name = 'Note off'
                    if(practice){
                        notes[event.noteNumber].stop(ac.currentTime);
                    }
                }
            });
        });

        connectAubioMedia(ac, freq => {
            if(freq){
                micFreq = 12 * (Math.log(freq / 440) / Math.log(2)) + 69
                tuner.innerHTML = freq + ' HZ';
            }
        })

        Player.instrument = soundfont;
        Player.loadDataUri('data:audio/midi;base64,' + data);
        Player.on('endOfFile', () => {
            Player.instrument.stop(ac.currentTime)
            setPlaying(false)
            removeHighlights();
            passedNotes = 0;
        });
        return Player;
    }

    useEffect(() => {
            setPlayer(null);
            removeHighlights();
            if (instrument && timeMap && ac && data) {
                initializePlayer().then((player) => {
                    setPlayer(player)
                })
            }
        },
        [instrument, ac, data, timeMap, practice]);

    return(
        player ?
            [
                <Button variant="outlined" className={'reveal-toolbar-button'} onClick={() => playPause()}>{playing ? 'Pause' : 'Start'}</Button>,
                <span className={'reveal-toolbar-button'}>
                    Practice<Switch disabled={playing} checked={practice} onChange={() => setPractice(!practice)}/>Free Play
                </span>
            ]
            :
            ac ?
                <Button className={'reveal-toolbar-button'}>Loading...</Button>
                :
                <Button variant="outlined" className={'reveal-toolbar-button'} onClick={() => connectMic()}>Begin Recital</Button>



    )
}
