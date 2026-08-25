import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_PLAYER = 'ahamaze_player';
const STORAGE_KEY_AVATAR = 'ahamaze_avatar';
const DEFAULT_AVATAR = '💖';

export function usePlayerProfile() {
  const [playerName, setPlayerNameState] = useState<string>('');
  const [playerEmoji, setPlayerEmojiState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_AVATAR) || DEFAULT_AVATAR;
    } catch {
      return DEFAULT_AVATAR;
    }
  });
  const [showLogin, setShowLogin] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedName = localStorage.getItem(STORAGE_KEY_PLAYER);
      if (savedName) {
        setPlayerNameState(savedName);
      } else {
        setShowLogin(true); // Prompt on very first visit
      }
    } catch {
      setShowLogin(true);
    }
  }, []);

  const setPlayerName = useCallback((name: string) => {
    setPlayerNameState(name);
    try {
      if (name.trim()) {
        localStorage.setItem(STORAGE_KEY_PLAYER, name.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_PLAYER);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setPlayerEmoji = useCallback((emoji: string) => {
    setPlayerEmojiState(emoji);
    try {
      localStorage.setItem(STORAGE_KEY_AVATAR, emoji);
    } catch {
      // Ignore storage errors
    }
  }, []);

  return {
    playerName,
    setPlayerName,
    playerEmoji,
    setPlayerEmoji,
    showLogin,
    setShowLogin,
  };
}
