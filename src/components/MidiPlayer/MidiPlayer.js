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
    voice = window.speechSynthesis.getVoices()[60];
};

export const MidiPlayer = async (ac, soundfont, data, freqRef, swiper, update, timeMap, soundFont, setCurNote, check, setExpectedNote) => {
    let timeOut;

    const interval2 = (midiNote, vrvMap) => {
        if(vrvMap.pitch === midiNote){
            vrvMap.highlight('passedNote')
            ReactDOM.unstable_batchedUpdates(() => {
                update(vrvMap.totalNotes / 2);
                setCurNote(Notes[vrvMap.pitch])
            })
        } else if(check.current){
            freqRef.current(interval2, vrvMap);
        }
    }

    const interval = (midiNote, vrvMap) => {
        switch (midiNote){
            case (vrvMap.pitch) :
                vrvMap.highlight('passedNote')
                ReactDOM.unstable_batchedUpdates(() => {
                    update(vrvMap.totalNotes);
                    setCurNote(Notes[midiNote])
                })
                break;
            case (vrvMap.pitch + 1) :
            case (vrvMap.pitch - 1) :
                freqRef.current(interval2, vrvMap);
                vrvMap.highlight('semiPassedNote')
                ReactDOM.unstable_batchedUpdates(() => {
                    update(vrvMap.totalNotes / 2);
                    setCurNote(Notes[midiNote])
                })
                break;
            default :
                check.current ? freqRef.current(interval, vrvMap) : vrvMap.highlight('failedNote')
        }
    }

    const altInterval2 = (midiNote, vrvMap) => {
        if(vrvMap.pitch === midiNote){
            vrvMap.highlight('passedNote')
            ReactDOM.unstable_batchedUpdates(() => {
                update(vrvMap.totalNotes / 2);
                setCurNote(Notes[vrvMap.pitch])
            })

            clearTimeout(timeOut)
            Player.pause();
            Player.play()
        } else if(check.current){
            freqRef.current(interval2, vrvMap);
        }
    }

    const altInterval = (midiNote, vrvMap) => {
        switch (midiNote){
            case (vrvMap.pitch) :
                vrvMap.highlight('passedNote')
                ReactDOM.unstable_batchedUpdates(() => {
                    update(vrvMap.totalNotes);
                    setCurNote(Notes[midiNote])
                })

                clearTimeout(timeOut)
                Player.pause()
                Player.play()
                break;
            case (vrvMap.pitch + 1) :
            case (vrvMap.pitch - 1) :
                freqRef.current(altInterval2, vrvMap);
                vrvMap.highlight('semiPassedNote')
                ReactDOM.unstable_batchedUpdates(() => {
                    update(vrvMap.totalNotes / 2);
                    setCurNote(Notes[midiNote])
                })
                break;
            default :
                check.current ? freqRef.current(interval, vrvMap) : vrvMap.highlight('failedNote')
        }
    }

    const startInterval = (vrvMap) => setTimeout(() => {
        check.current = true;
        freqRef.current(interval, vrvMap);
        vrvMap.highlight('highlightedNote')
    }, 60)

    const altStartInterval = (vrvMap) => setTimeout(() => {
        check.current = true;
        freqRef.current(altInterval, vrvMap);
        vrvMap.highlight('highlightedNote')
    }, 60)

    const playMidi = (vrvMap) => soundFont.play(vrvMap.pitch, ac.currentTime, {
        duration: vrvMap.time,
        format: 'ogg',
        notes: vrvMap.pitch
    })

    const modeActions = {
        'listen' : (vrvMap) => {
            playMidi(vrvMap)
            startInterval(vrvMap);
        },
        'practice hard' : (vrvMap) => {
            startInterval(vrvMap);
        },
        'practice medium' : (vrvMap) => {
            altStartInterval(vrvMap);
            Player.pause()
            timeOut = setTimeout(() => {
                if(check.current)
                    Player.play()
            }, vrvMap.time * 1000)
        },
        'practice easy' : (vrvMap) => {
            altStartInterval(vrvMap);
            Player.pause();
            timeOut = setTimeout(() => {
                if(check.current)
                    Player.play()
            }, vrvMap.time * 2000)
        },
        'free play' : (vrvMap) => {
            Player.pause()
            altStartInterval(vrvMap);
        },
        'training' : (vrvMap) => {
            setTimeout(() => {
                check.current = true;
                Player.pause()
                playMidi(vrvMap);
                vrvMap.visibility("hide")
                setTimeout(() => {
                    vrvMap.visibility("visible");
                    freqRef.current(interval, vrvMap);
                    vrvMap.highlight('highlightedNote')
                    setExpectedNote(Notes[vrvMap.pitch])
                }, vrvMap.time * 2000)

                setTimeout(() => {
                    if(check.current){
                        Player.play();
                    }
                }, vrvMap.time * 3000)
            }, 60)
        },
        'vocal' : (vrvMap) => {
            setTimeout(() => {
                check.current = true;
                vrvMap.visibility("hide")
                Player.pause()
                const noteName = new SpeechSynthesisUtterance(vrvMap.pitch.charAt(1) === 'b' ? vrvMap.pitch.charAt(0) + 'flat' : vrvMap.pitch.charAt(0) + vrvMap.pitch.charAt(1));
                noteName.voice = voice
                synth.pitch = parseInt(Notes[vrvMap.pitch].charAt(2)) / 6
                synth.speak(noteName);
                noteName.onend = function() {
                    vrvMap.visibility("visible")
                    if(check.current){
                        Player.play()
                        playMidi(vrvMap)
                        check.current = true;
                        freqRef.current(interval, vrvMap);
                        vrvMap.highlight('highlightedNote')
                        setExpectedNote(Notes[vrvMap.pitch])
                    }
                }
            }, 60)
        }
    }

    let func = modeActions["listen"]

    const Player =  await new MidiPlayerJs.Player(function (event){
        if(event.velocity){
            const time = event.tick / Player.division
            const vrvMap = timeMap[time]

            if (vrvMap.page === swiper.details().relativeSlide) {
                func(vrvMap)
                setExpectedNote(Notes[vrvMap.pitch])
            } else {
                func(vrvMap)
                setExpectedNote(Notes[vrvMap.pitch])
                swiper.moveToSlide(vrvMap['page'])
            }

        } else {
            setTimeout(() => {
                check.current = false;
            }, 60)
        }
    })

    Player.instrument = soundfont;
    Player.loadDataUri('data:audio/midi;base64,' + data);
    Player.on('mode', (mode) => {
        func = modeActions[mode]
    })

    return  Player;
}
