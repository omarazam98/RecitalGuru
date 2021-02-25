import MidiPlayerJs from 'midi-player-js'
import React from "react";
import * as Aubio from '../../../aubio/aubio'

const Notes = {
    127: 'G9',
    126: 'Gb9',
    125: 'F9',
    124: 'E9',
    123: 'Eb9',
    122: 'D9',
    121: 'Db9',
    120: 'C9',
    119: 'B8',
    118: 'Bb8',
    117: 'A8',
    116: 'Ab8',
    115: 'G8',
    114: 'Gb8',
    113: 'F8',
    112: 'E8',
    111: 'Eb8',
    110: 'D8',
    109: 'Db8',
    108: 'C8',
    107: 'B7',
    106: 'Bb7',
    105: 'A7',
    104: 'Ab7',
    103: 'G7',
    102: 'Gb7',
    101: 'F7',
    100: 'E7',
    99:	'Eb7',
    98:	'D7',
    97:	'Db7',
    96:	'C7',
    95:	'B6',
    94:	'Bb6',
    93:	'A6',
    92:	'Ab6',
    91:	'G6',
    90:	'Gb6',
    89:	'F6',
    88:	'E6',
    87:	'Eb6',
    86:	'D6',
    85:	'Db6',
    84:	'C6',
    83:	'B5',
    82:	'Bb5',
    81:	'A5',
    80:	'Ab5',
    79:	'G5',
    78:	'Gb5',
    77:	'F5',
    76:	'E5',
    75:	'Eb5',
    74:	'D5',
    73:	'Db5',
    72:	'C5',
    71:	'B4',
    70:	'Bb4',
    69:	'A4',
    68:	'Ab4',
    67:	'G4',
    66:	'Gb4',
    65:	'F4',
    64:	'E4',
    63:	'Eb4',
    62:	'D4',
    61:	'Db4',
    60: 'C4',
    59:	'B3',
    58:	'Bb3',
    57:	'A3',
    56:	'Ab3',
    55:	'G3',
    54:	'Gb3',
    53:	'F3',
    52:	'E3',
    51:	'Eb3',
    50:	'D3',
    49:	'Db3',
    48:	'C3',
    47:	'B2',
    46:	'Bb2',
    45:	'A2',
    44:	'Ab2',
    43:	'G2',
    42:	'Gb2',
    41:	'F2',
    40:	'E2',
    39:	'Eb2',
    38:	'D2',
    37:	'Db2',
    36:	'C2',
    35:	'B1',
    34:	'Bb1',
    33:	'A1',
    32:	'Ab1',
    31:	'G1',
    30:	'Gb1',
    29:	'F1',
    28:	'E1',
    27:	'Eb1',
    26:	'D1',
    25:	'Db1',
    24:	'C1',
    23:	'B0',
    22:	'Bb0',
    21:	'A0'
}

let pitchDetector;
export const MidiPlayer = async (ac, soundfont, data, freqRef, practice, swiper, update, timeMap, soundFont, setCurNote, check, setExpectedNote) => {
    Aubio().then((aubio) => {
        pitchDetector = new aubio.Pitch('default', 1024, 512, ac.sampleRate)

    })

    const Player =  await new MidiPlayerJs.Player(function (event){
        if(event.velocity){
            const time = event.tick / Player.division
            const vrvMap = timeMap[time]

            setExpectedNote(Notes[event.noteNumber])
            vrvMap.on.add('highlightedNote')


            if (!practice.current) {
                soundFont.play(event.noteName, ac.currentTime, {
                    duration: vrvMap.time,
                    gain: event.velocity / 10,
                    format: 'ogg',
                    notes: event.noteNumber
                })
            }

            const interval = (c) => {
                switch (c) {
                    case (event.noteNumber) :
                        vrvMap.on.add('passedNote')
                        update();
                        setCurNote(Notes[c])
                        break
                    case "Missed" :
                        vrvMap.on.add('failedNote')
                        const note = Notes[c] ? Notes[c] : 'N/A'
                        setCurNote(note)
                        break
                    default :
                        const c2 = check.current ? Math.round(12 * (Math.log(pitchDetector.do(freqRef.current) / 440) / Math.log(2)) + 69) : "Missed"
                        requestAnimationFrame( () => interval(c2));
                        break;
                }
            }

            setTimeout(() => {
                check.current = true;
                interval()
            }, 225)

            if ((vrvMap['page']) !== swiper.activeIndex) {
                swiper.slideTo(vrvMap['page'])
            }

        } else {
            check.current = false;
        }
    })

    Player.instrument = soundfont;
    Player.loadDataUri('data:audio/midi;base64,' + data);

    return  Player;
}
