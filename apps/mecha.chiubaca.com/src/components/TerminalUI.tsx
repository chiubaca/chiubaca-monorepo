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
      `>> SYSTEM.ANALYZE(TARGET: ${skill.bodyPart})`,
      "",
      `[${skill.category}]`,
      "",
      `${skill.name.toUpperCase()}`,
      `PROFICIENCY: ${skill.level}%`,
      "",
      skill.description,
      "",
      "CORE_CAPABILITIES:",
      ...skill.details.map((detail) => `  • ${detail}`),
      "",
      ">> END_ANALYSIS",
    ];

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
          MECHA.DEV // PORTFOLIO_SYS v1.0
        </div>
        <div className="terminal-controls">
          <button className="terminal-btn" onClick={onReset}>
            [RESET_VIEW]
          </button>
        </div>
      </div>

      {!isExpanded && activeSkill && (
        <div className="terminal-compact-info">
          <div className="compact-skill-name">{activeSkill.name.toUpperCase()}</div>
          <div className="compact-body-part">
            <span className="compact-label">TARGET:</span>
            <span className="compact-value">{activeSkill.bodyPart}</span>
          </div>
          <button className="terminal-btn compact-expand-btn" onClick={onToggleExpand}>
            [VIEW_DETAILS]
          </button>
        </div>
      )}

      <div className="terminal-content">
        {!activeSkill ? (
          <div className="terminal-welcome">
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;&gt;</span> SYSTEM.INIT()
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;&gt;</span> LOADING_MECHA_FRAMEWORK...
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;&gt;</span>{" "}
              <span className="terminal-success">[OK]</span> FRAMEWORK_LOADED
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;&gt;</span> MOUNTING_PORTFOLIO_INTERFACE...
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;&gt;</span>{" "}
              <span className="terminal-success">[OK]</span> INTERFACE_READY
            </div>
            <div className="terminal-line spacer" />
            <div className="terminal-line terminal-highlight">
              ╔══════════════════════════════════════╗
            </div>
            <div className="terminal-line terminal-highlight">
              ║ INTERACTIVE MECHA SKILL MATRIX ║
            </div>
            <div className="terminal-line terminal-highlight">
              ╚══════════════════════════════════════╝
            </div>
            <div className="terminal-line spacer" />
            <div className="terminal-line">
              <span className="terminal-prompt">&gt;&gt;</span> INSTRUCTIONS:
            </div>
            <div className="terminal-line indent">1. HOVER over body parts to scan</div>
            <div className="terminal-line indent">2. CLICK to analyze skill details</div>
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
          SKILLS: 10 | STATUS: {selectedSkill ? "ANALYZING" : hoveredSkill ? "SCANNING" : "IDLE"}
        </div>
      </div>
    </div>
  );
};

function getLineClass(line: string): string {
  if (line.includes("SYSTEM.ANALYZE")) return "terminal-command";
  if (line.includes("[") && line.includes("]")) return "terminal-category";
  if (line.includes("PROFICIENCY")) return "terminal-stat";
  if (line.includes(">>")) return "terminal-prompt-line";
  if (line.startsWith("  •")) return "terminal-detail";
  if (line.includes("END_ANALYSIS")) return "terminal-command";
  return "";
}
