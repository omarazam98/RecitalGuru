import MidiPlayerJs from 'midi-player-js'
import {connectAubioMedia, removeHighlights} from "./MidiFunctions";
import React from "react";
export const MidiPlayer = async (ac, soundfont, data, timeMap , practice) => {
    let micFreq = 0;
    let totalNotes = document.getElementsByClassName('note').length
    let passedNotes = 0;
    let notes = {};

    const tuner = document.getElementById('tuner')
    const score = document.getElementById('score')


    connectAubioMedia(ac, (freq) => {
        if(freq){
            micFreq = 12 * (Math.log(freq / 440) / Math.log(2)) + 69
            tuner.innerHTML = 'Hz: ' + freq;
        }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const Player = new MidiPlayerJs.Player(function (event) {
        const time = event.tick / Player.division
        const vrvMap = timeMap[time]

        if (event.velocity > 0 && vrvMap.off.length > 0) {
            if(!practice){
                notes[event.noteNumber] = soundfont.play(event.noteName, ac.currentTime, {
                    gain: 1,
                    format: 'ogg',
                    notes: event.noteNumber
                })
            }

            const startTime = ac.currentTime
            const interval = setInterval(() => {
                if (Math.abs(micFreq - event.noteNumber) <= 1) {
                    document.getElementById(vrvMap.off).classList.add('passedNote')
                    passedNotes++
                    clearInterval(interval);
                } else if ((ac.currentTime - startTime) > vrvMap.time) {
                    document.getElementById(vrvMap.off).classList.add('failedNote')
                    clearInterval(interval);
                }
            }, 225)

            score.innerHTML = Math.round((passedNotes) / totalNotes * 1000) / 10 + ' %'
            document.getElementById(vrvMap.on).classList.add('highlightedNote')

        } else if (event.velocity === 0) {
            if(!practice){
                event.name = 'Note off'
                notes[event.noteNumber].stop(ac.currentTime);
            }
        }
    });

    Player.on('endOfFile' , () => {
        passedNotes = 0
    })

    Player.instrument = soundfont;
    Player.loadDataUri('data:audio/midi;base64,' + data);
    return Player;
}
