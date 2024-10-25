/* eslint-disable react/prop-types */
import { createContext, useEffect, useRef, useState } from "react";
import { songsData } from "../assets/assets";

// eslint-disable-next-line react-refresh/only-export-components
export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();

  const [track, setTrack] = useState(songsData[0]);
  const [playerStatus, setPlayerStatus] = useState(false);
  const [time, setTime] = useState({
    currentTime: {
      second: 0,
      minute: 0,
    },
    totalTime: {
      second: 0,
      minute: 0,
    },
  });
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleQueue, setShuffleQueue] = useState([]);

  const play = () => {
    audioRef.current.play();
    setPlayerStatus(true);
  };
  const pause = () => {
    audioRef.current.pause();
    setPlayerStatus(false);
  };

  const playWithId = async (id) => {
    await setTrack(songsData[id]);
    await audioRef.current.play();
    setPlayerStatus(true);
  };

  const previous = async () => {
    if (track.id > 0) {
      await setTrack(songsData[track.id - 1]);
      await audioRef.current.play();
      setPlayerStatus(true);
    }
  };
  const next = async () => {
    if (isShuffling) {
      // Play next track from shuffle queue
      const nextTrack = shuffleQueue.length ? shuffleQueue.pop() : track.id + 1;
      if (nextTrack < songsData.length) {
        await setTrack(songsData[nextTrack]);
        await audioRef.current.play();
        setPlayerStatus(true);
      }
    } else {
      if (track.id < songsData.length - 1) {
        await setTrack(songsData[track.id + 1]);
        await audioRef.current.play();
        setPlayerStatus(true);
      }
    }
  };

  const seekSong = async (e) => {
    audioRef.current.currentTime =
      (e.nativeEvent.offsetX / seekBg.current.offsetWidth) *
      audioRef.current.duration;
  };

  const toggleLoop = () => {
    setIsLooping((prev) => !prev);
  };

  const toggleShuffle = () => {
    setIsShuffling((prev) => !prev);
    // Shuffle songs when shuffle is enabled
    if (!isShuffling) {
      const shuffled = [...songsData].sort(() => Math.random() - 0.5);
      setShuffleQueue(shuffled.map((song, index) => index)); // Store shuffled indices
    } else {
      setShuffleQueue([]); // Reset shuffle queue when disabling
    }
  };

  useEffect(() => {
    audioRef.current.onended = () => {
      if (isLooping) {
        audioRef.current.play(); // Replay current track
      } else {
        next(); // Play next track
      }
    };

    setTimeout(() => {
      audioRef.current.ontimeupdate = () => {
        seekBar.current.style.width =
          Math.floor(
            (audioRef.current.currentTime / audioRef.current.duration) * 100
          ) + "%";
        setTime({
          currentTime: {
            second: Math.floor(audioRef.current.currentTime % 60),
            minute: Math.floor(audioRef.current.currentTime / 60),
          },
          totalTime: {
            second: Math.floor(audioRef.current.duration % 60),
            minute: Math.floor(audioRef.current.duration / 60),
          },
        });
      };
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRef, isLooping, isShuffling]);

  const contextValue = {
    audioRef,
    seekBar,
    seekBg,
    track,
    setTrack,
    playerStatus,
    setPlayerStatus,
    time,
    setTime,
    play,
    pause,
    playWithId,
    previous,
    next,
    seekSong,
    toggleLoop,
    toggleShuffle,
    isLooping,
    isShuffling,
  };
  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;
