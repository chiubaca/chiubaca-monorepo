import React, { useEffect, useRef, useState } from "react";
import { Skill } from "../data/skills";

interface TerminalUIProps {
  selectedSkill: Skill | null;
  hoveredSkill: Skill | null;
  onReset: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const TerminalUI: React.FC<TerminalUIProps> = ({
  selectedSkill,
  hoveredSkill,
  onReset,
  isExpanded,
  onToggleExpand,
}) => {
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect for skill display
  useEffect(() => {
    // Clear any existing typing
    if (typingRef.current) {
      clearTimeout(typingRef.current);
    }

    const skill = selectedSkill || hoveredSkill;

    if (!skill) {
      setDisplayLines([]);
      setCurrentLineIndex(0);
      setIsTyping(false);
      return;
    }

    const lines = [
      `>> SYSTEM.ANALYZE(TARGET: ${skill.part.toUpperCase()})`,
      "",
      `[${skill.category.toUpperCase()}]`,
      "",
      `${skill.name.toUpperCase()}`,
      `DESIGNATION: ${skill.designation}`,
      "",
      skill.description,
      "",
      "ASSEMBLY NOTES:",
      ...skill.details.map((detail) => `  • ${detail}`),
      "",
      ">> END_ANALYSIS",
    ];
    if (
      matchMedia(
        "(max-width: 767px), (max-height: 500px) and (pointer: coarse), (prefers-reduced-motion: reduce)",
      ).matches
    ) {
      setDisplayLines(lines);
      setCurrentLineIndex(lines.length);
      setIsTyping(false);
      return;
    }

    setDisplayLines([]);
    setCurrentLineIndex(0);
    setIsTyping(true);

    const typeNextLine = (lineIndex: number) => {
      if (lineIndex >= lines.length) {
        setIsTyping(false);
        return;
      }

      const line = lines[lineIndex];
      let charIndex = 0;

      const typeChar = () => {
        if (charIndex <= line.length) {
          setDisplayLines((prev) => {
            const newLines = [...prev];
            newLines[lineIndex] = line.slice(0, charIndex);
            return newLines;
          });
          charIndex++;
          typingRef.current = setTimeout(typeChar, 15);
        } else {
          setCurrentLineIndex(lineIndex + 1);
          typingRef.current = setTimeout(() => typeNextLine(lineIndex + 1), 50);
        }
      };

      typeChar();
    };

    typingRef.current = setTimeout(() => typeNextLine(0), 100);

    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
    };
  }, [selectedSkill, hoveredSkill]);

  const activeSkill = selectedSkill || hoveredSkill;

  return (
    <div className={`terminal-container ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="terminal-prompt">&gt;&gt;</span>
          <span className="terminal-title-desktop">MOBILE SUIT // HANGAR 01</span>
          <span className="terminal-title-mobile">
            <strong>{activeSkill?.name ?? "HANGAR 01"}</strong>
            <small>
              {activeSkill
                ? `${activeSkill.designation} // ${selectedSkill ? "LOCKED" : "SCANNING"}`
                : "● STANDBY"}
            </small>
          </span>
        </div>
        <div className="terminal-controls">
          {selectedSkill && (
            <button
              type="button"
              className="terminal-btn mobile-details-toggle"
              aria-controls="hangar-dossier"
              aria-expanded={isExpanded}
              onClick={onToggleExpand}
            >
              {isExpanded ? "[CLOSE]" : "[INFO]"}
            </button>
          )}
          <button type="button" className="terminal-btn" aria-label="Reset view" onClick={onReset}>
            [RESET]
          </button>
        </div>
      </div>

      <div className="terminal-content" id="hangar-dossier">
        {!activeSkill ? (
          <div className="terminal-welcome">
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;&gt;</span> SYSTEM.INIT()
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;&gt;</span> CALIBRATING FRAME SCANNER...
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;&gt;</span>{" "}
              <span className="terminal-success">[OK]</span> FRAME IDENTIFIED
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;&gt;</span> LOADING PARTS MANIFEST...
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;&gt;</span>{" "}
              <span className="terminal-success">[OK]</span> SCANNER READY
            </div>
            <div className="terminal-line spacer" />
            <div className="terminal-line terminal-highlight">
              ╔══════════════════════════════════════╗
            </div>
            <div className="terminal-line terminal-highlight">
              ║ MOBILE SUIT // PARTS MANIFEST ║
            </div>
            <div className="terminal-line terminal-highlight">
              ╚══════════════════════════════════════╝
            </div>
            <div className="terminal-line spacer" />
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;&gt;</span> INSTRUCTIONS:
            </div>
            <div className="terminal-line indent">1. HOVER over body parts to scan</div>
            <div className="terminal-line indent">2. CLICK to lock on and inspect a part</div>
            <div className="terminal-line indent">3. Press [ESC] or [RESET] to return</div>
            <div className="terminal-line spacer" />
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;&gt;</span> WAITING_FOR_INPUT
              <span className={`terminal-cursor ${showCursor ? "visible" : ""}`}>_</span>
            </div>
          </div>
        ) : (
          <div className="terminal-skill-display">
            {displayLines.map((line, index) => (
              <div key={index} className={`terminal-line ${getLineClass(line)}`}>
                {line}
                {index === currentLineIndex - 1 && isTyping && (
                  <span className={`terminal-cursor ${showCursor ? "visible" : ""}`}>_</span>
                )}
              </div>
            ))}
            {!isTyping && (
              <div className="terminal-line">
                <span className="terminal-prompt">&gt;&gt;</span> ANALYSIS_COMPLETE
                <span className={`terminal-cursor ${showCursor ? "visible" : ""}`}>_</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="terminal-footer">
        <div className="terminal-status">
          <span className="status-indicator active" />
          SYSTEM_ONLINE
        </div>
        <div className="terminal-stats">
          STATUS: {selectedSkill ? "LOCKED" : hoveredSkill ? "SCANNING" : "IDLE"}
        </div>
      </div>
    </div>
  );
};

function getLineClass(line: string): string {
  if (line.includes("SYSTEM.ANALYZE")) return "terminal-command";
  if (line.includes("[") && line.includes("]")) return "terminal-category";
  if (line.startsWith("DESIGNATION")) return "terminal-stat";
  if (line.includes(">>")) return "terminal-prompt-line";
  if (line.startsWith("  •")) return "terminal-detail";
  if (line.includes("END_ANALYSIS")) return "terminal-command";
  return "";
}
