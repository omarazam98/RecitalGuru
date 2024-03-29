import MidiPlayerJs from 'midi-player-js'
import ReactDOM from "react-dom";

const Notes = {
    127: 'G 9',
    126: 'Gb9',
    125: 'F 9',
    124: 'E 9',
    123: 'Eb9',
    122: 'D 9',
    121: 'Db9',
    120: 'C 9',
    119: 'B 8',
    118: 'Bb8',
    117: 'A 8',
    116: 'Ab8',
    115: 'G 8',
    114: 'Gb8',
    113: 'F 8',
    112: 'E 8',
    111: 'Eb8',
    110: 'D 8',
    109: 'Db8',
    108: 'C 8',
    107: 'B 7',
    106: 'Bb7',
    105: 'A 7',
    104: 'Ab7',
    103: 'G 7',
    102: 'Gb7',
    101: 'F 7',
    100: 'E 7',
    99:	'Eb7 ',
    98:	'D 7',
    97:	'Db7',
    96:	'C 7',
    95:	'B 6',
    94:	'Bb6',
    93:	'A 6',
    92:	'Ab6',
    91:	'G 6',
    90:	'Gb6',
    89:	'F 6',
    88:	'E 6',
    87:	'Eb6',
    86:	'D 6',
    85:	'Db6',
    84:	'C 6',
    83:	'B 5',
    82:	'Bb5',
    81:	'A 5',
    80:	'Ab5',
    79:	'G 5',
    78:	'Gb5',
    77:	'F 5',
    76:	'E 5',
    75:	'Eb5',
    74:	'D 5',
    73:	'Db5',
    72:	'C 5',
    71:	'B 4',
    70:	'Bb4',
    69:	'A 4',
    68:	'Ab4',
    67:	'G 4',
    66:	'Gb4',
    65:	'F 4',
    64:	'E 4',
    63:	'Eb4',
    62:	'D 4',
    61:	'Db4',
    60: 'C 4',
    59:	'B 3',
    58:	'Bb3',
    57:	'A 3',
    56:	'Ab3',
    55:	'G 3',
    54:	'Gb3',
    53:	'F 3',
    52:	'E 3',
    51:	'Eb3',
    50:	'D 3',
    49:	'Db3',
    48:	'C 3',
    47:	'B 2',
    46:	'Bb2',
    45:	'A 2',
    44:	'Ab2',
    43:	'G 2',
    42:	'Gb2',
    41:	'F 2',
    40:	'E 2',
    39:	'Eb2',
    38:	'D 2',
    37:	'Db2',
    36:	'C 2',
    35:	'B 1',
    34:	'Bb1',
    33:	'A 1',
    32:	'Ab1',
    31:	'G 1',
    30:	'Gb1',
    29:	'F 1',
    28:	'E 1',
    27:	'Eb1',
    26:	'D 1',
    25:	'Db1',
    24:	'C 1',
    23:	'B 0',
    22:	'Bb0',
    21:	'A 0'
}





const synth = window.speechSynthesis;
let voice;
window.speechSynthesis.onvoiceschanged = function() {
    console.log( window.speechSynthesis.getVoices())
    voice = window.speechSynthesis.getVoices()[2];
};

export const MidiPlayer = async (ac, soundfont, data, freqRef, swiper, update, timeMap, soundFont, setCurNote, check, setExpectedNote) => {
    let timeOut;
    let currentInterval
    let vrvMap;
    let prevVrvMap;

    const interval = (midiNote) => {
        switch (midiNote){
            case (vrvMap.pitch) :
                clearInterval(currentInterval)
                currentInterval = 0;
                vrvMap.highlight('passedNote')
                ReactDOM.unstable_batchedUpdates(() => {
                    update(vrvMap.totalNotes / 2);
                    setCurNote(Notes[midiNote])
                })
                break;
            case (vrvMap.pitch + 1) :
            case (vrvMap.pitch - 1) :
                currentInterval = setTimeout(() => freqRef(interval2), 0)
                vrvMap.highlight('semiPassedNote')
                ReactDOM.unstable_batchedUpdates(() => {
                    update(vrvMap.totalNotes / 2);
                    setCurNote(Notes[midiNote])
                })
                break;
            default :
                currentInterval = setTimeout(() => freqRef(interval), 0)
        }
    }

    const interval2 = (midiNote) => {
        if(vrvMap.pitch === midiNote){
            clearInterval(currentInterval)
            currentInterval = 0;
            vrvMap.highlight('passedNote')
            ReactDOM.unstable_batchedUpdates(() => {
                update(vrvMap.totalNotes / 2);
                setCurNote(Notes[midiNote])
            })
        } else {
            currentInterval = setTimeout(() => freqRef(interval2), 0)
        }
    }

    const altInterval = (midiNote) => {
        switch (midiNote){
            case (vrvMap.pitch) :
                clearInterval(currentInterval)
                currentInterval = 0;
                vrvMap.highlight('passedNote')
                ReactDOM.unstable_batchedUpdates(() => {
                    update(vrvMap.totalNotes / 2);
                    setCurNote(Notes[midiNote])
                })
                clearTimeout(timeOut)
                Player.pause();
                Player.play()
                break;
            case (vrvMap.pitch + 1) :
            case (vrvMap.pitch - 1) :
                currentInterval = setTimeout(() => freqRef(altInterval2), 0)
                vrvMap.highlight('semiPassedNote')
                ReactDOM.unstable_batchedUpdates(() => {
                    update(vrvMap.totalNotes / 2);
                    setCurNote(Notes[midiNote])
                })
                break;
            default :
                currentInterval = setTimeout(() => freqRef(altInterval), 0)
        }
    }

    const altInterval2 = (midiNote) => {
        if(vrvMap.pitch === midiNote){
            clearInterval(currentInterval)
            currentInterval = 0;
            vrvMap.highlight('passedNote')
            ReactDOM.unstable_batchedUpdates(() => {
                update(vrvMap.totalNotes / 2);
                setCurNote(Notes[midiNote])
            })
            clearTimeout(timeOut)
            Player.pause();
            Player.play()
        } else {
            currentInterval = setTimeout(() => freqRef(altInterval2), 0)
        }
    }

    const startInterval = () => setTimeout(() => {
        prevVrvMap = vrvMap;
        freqRef(interval);
        vrvMap.highlight('highlightedNote')
    }, 60)

    const startAltInterval = () => setTimeout(() => {
        prevVrvMap = vrvMap;
        freqRef(altInterval);
        vrvMap.highlight('highlightedNote')
    }, 60)

    const playMidi = () => soundFont.play(vrvMap.pitch, ac.currentTime, {
        duration: vrvMap.time,
        gain: 20,
        format: 'ogg',
        notes: vrvMap.pitch
    })

    const modeActions = {
        'listen' : () => {
            playMidi()
            startInterval();
        },
        'practice hard' : () => {
            startInterval();
        },
        'practice medium' : () => {
            startAltInterval();
            Player.pause()
            timeOut = setTimeout(() => {
                if(check.current)
                    Player.play()
            }, vrvMap.time * 1000)
        },
        'practice easy' : () => {
            startAltInterval();
            Player.pause();
            timeOut = setTimeout(() => {
                if(check.current)
                    Player.play()
            }, vrvMap.time * 2000)
        },
        'free play' : () => {
            Player.pause()
            startAltInterval();
        },
        'training' : () => {
            Player.pause()
            playMidi();
            vrvMap.visibility("hide")
            setTimeout(() => {
                vrvMap.visibility("visible");
                startInterval()
            }, vrvMap.time * 2000)

            setTimeout(() => {
                if(check.current){
                    Player.play();
                }
            }, vrvMap.time * 3000)
        },
        'vocal' : () => {
            vrvMap.visibility("hide")
            Player.pause()
            const noteName = new SpeechSynthesisUtterance(Notes[vrvMap.pitch].charAt(1) === 'b' ? Notes[vrvMap.pitch].charAt(0) + 'flat' : Notes[vrvMap.pitch].charAt(0) + Notes[vrvMap.pitch].charAt(1));
            noteName.voice = voice
            synth.speak(noteName);
            noteName.onend = function() {
                vrvMap.visibility("visible")
                    if(check.current){
                        Player.play()
                        playMidi();
                        startInterval()
                    }
            }
        }
    }

    let func = modeActions['listen']

    const Player = await new MidiPlayerJs.Player(function (event){
        if(event.velocity){
            vrvMap = timeMap[event.tick / Player.division]
            func()
            setExpectedNote(Notes[event.noteNumber])

        } else if(currentInterval){
            const vrvMap = prevVrvMap;
            setTimeout(() => {
                if(currentInterval){
                    clearTimeout(currentInterval);
                    currentInterval = 0;
                    vrvMap.highlight('failedNote')
                }
            }, 60)
        }
    })

    Player.instrument = soundfont;
    Player.loadDataUri('data:audio/midi;base64,' + data);
    Player.on('pause', () => clearTimeout(currentInterval))
    Player.on('mode', (mode) => func = modeActions[mode])
    return  Player;
}
