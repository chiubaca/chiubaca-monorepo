import { useState, useCallback } from "react";

interface TypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

export const useTypewriter = () => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentText, setCurrentText] = useState("");

  const typeText = useCallback((options: TypewriterOptions) => {
    const { text, speed = 30, delay = 0, onComplete } = options;

    setCurrentText(text);
    setDisplayText("");
    setIsTyping(true);

    setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);
  }, []);

  const clearText = useCallback(() => {
    setDisplayText("");
    setCurrentText("");
    setIsTyping(false);
  }, []);

  return {
    displayText,
    isTyping,
    currentText,
    typeText,
    clearText,
  };
};
