import { useEffect, useRef } from 'react';

const useAutoMessageClear = (messages, setMessages, duration = 3000) => {
  const timersRef = useRef({});

  useEffect(() => {
    // Cleanup timers for messages that were removed externally (this is just incase)
    Object.keys(timersRef.current).forEach((id) => {
      if (!messages[id]) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    });

    // Set new timers for messages that don't have one yet (and handle deletion of messages and timers after 3 seconds)
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

    // Cleanup function - clear all timers on unmount or when messages change
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
    };
  }, [messages, setMessages, duration]);
};

export default useAutoMessageClear;