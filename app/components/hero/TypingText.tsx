import { Text } from "@react-three/drei";
import { useEffect, useState } from "react";

const TITLES = [
  "Full Stack Developer",
  "AI/ML Developer",
  "Cloud and DevOps"
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TypingText = ({ position, fontProps }: { position: [number, number, number], fontProps: any }) => {
  const [text, setText] = useState("");
  const [titleIndex, setTitleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentTitle = TITLES[titleIndex];
    
    let timerId: NodeJS.Timeout;

    if (!isDeleting) {
      if (text.length < currentTitle.length) {
        timerId = setTimeout(() => {
          setText(currentTitle.substring(0, text.length + 1));
        }, 100);
      } else {
        // Pause before deleting
        timerId = setTimeout(() => setIsDeleting(true), 1500);
      }
    } else {
      if (text.length > 0) {
        timerId = setTimeout(() => {
          setText(currentTitle.substring(0, text.length - 1));
        }, 50); // Faster backspace
      } else {
        setIsDeleting(false);
        setTitleIndex((prev) => (prev + 1) % TITLES.length);
      }
    }

    return () => clearTimeout(timerId);
  }, [text, isDeleting, titleIndex]);

  return (
    <Text position={position} {...fontProps}>
      {text + "|"}
    </Text>
  );
};
