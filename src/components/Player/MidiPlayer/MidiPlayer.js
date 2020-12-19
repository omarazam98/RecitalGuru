import MidiPlayerJs from 'midi-player-js'
import React from "react";

export const MidiPlayer = async (ac, soundfont, data, timeMap , practice) => {
    let notes = {};

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const Player = new MidiPlayerJs.Player(function (event) {
        const time = event.tick / Player.division
        const vrvMap = timeMap[time]

        if (event.velocity > 0 && vrvMap.on.length > 0) {
            if (!practice) {
                notes[event.noteNumber] = soundfont.play(event.noteName, ac.currentTime, {
                    gain: event.velocity / 10,
                    format: 'ogg',
                    notes: event.noteNumber
                })
            }

            document.getElementById(vrvMap.on).classList.add('highlightedNote')

        } else if (event.velocity === 0) {
            if (!practice) {
                event.name = 'Note off'
                notes[event.noteNumber].stop(ac.currentTime);
            }
        }
    });

    Player.instrument = soundfont;
    Player.loadDataUri('data:audio/midi;base64,' + data);
    return Player;
}
