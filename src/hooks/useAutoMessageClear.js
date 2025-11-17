import { useEffect, useRef } from 'react';

const useAutoMessageClear = (messages, setMessages, duration = 3000) => {
  const timersRef = useRef({});

  // Main logic: create timers, clean removed messages
  useEffect(() => {
    // Clean orphan timers
    Object.keys(timersRef.current).forEach((id) => {
      if (!messages[id]) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    });

    // Create timers for new messages
    Object.keys(messages).forEach((id) => {
      if (!timersRef.current[id]) {
        timersRef.current[id] = setTimeout(() => {
          setMessages((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
          });

          delete timersRef.current[id];
        }, duration);
      }
    });
  }, [messages, setMessages, duration]);

  // Cleanup on unmount only
  useEffect(() => {
    const timers = timersRef.current; // capture stable reference

    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);
};

export default useAutoMessageClear;
