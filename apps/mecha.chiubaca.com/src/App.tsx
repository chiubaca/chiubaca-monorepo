import React, { useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import { getSkillById } from "./data/skills";
import { skillList } from "./data/skillConfig";
import { GundamModel } from "./components/GundamModel";
import { CameraController } from "./components/CameraController";
import { GridFloor } from "./components/GridFloor";
import { TerminalUI } from "./components/TerminalUI";
import { MobileSkillsPanel } from "./components/MobileSkillsPanel";

const App: React.FC = () => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);

  const hoveredSkillData = hoveredSkill ? getSkillById(hoveredSkill) : null;
  const selectedSkillData = selectedSkill ? getSkillById(selectedSkill) : null;

  const handlePartHover = useCallback(
    (skillId: string | null) => {
      if (!selectedSkill) {
        setHoveredSkill(skillId);
      }
    },
    [selectedSkill],
  );

  const handlePartClick = useCallback(
    (skillId: string) => {
      if (selectedSkill === skillId) {
        setSelectedSkill(null);
        setIsTerminalExpanded(false);
      } else {
        setSelectedSkill(skillId);
        setHoveredSkill(null);
        // Keep terminal collapsed on mobile - user must manually expand
      }
    },
    [selectedSkill],
  );

  const handleReset = useCallback(() => {
    setSelectedSkill(null);
    setHoveredSkill(null);
    setIsTerminalExpanded(false);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleReset]);

  return (
    <div className="app-container">
      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 3, 10], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ff41" />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#008822" />

          <CameraController targetSkill={selectedSkillData || hoveredSkillData || null} />

          <GridFloor />

          <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={0.5} />

          <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
            <GundamModel
              hoveredSkill={hoveredSkill}
              selectedSkill={selectedSkill}
              onPartHover={handlePartHover}
              onPartClick={handlePartClick}
            />
          </Float>
        </Canvas>
      </div>

      <TerminalUI
        selectedSkill={selectedSkillData || null}
        hoveredSkill={hoveredSkillData || null}
        onReset={handleReset}
        isExpanded={isTerminalExpanded}
        onToggleExpand={() => setIsTerminalExpanded(!isTerminalExpanded)}
      />

      <MobileSkillsPanel
        selectedSkill={selectedSkill}
        hoveredSkill={hoveredSkill}
        onSkillSelect={handlePartClick}
        onSkillHover={handlePartHover}
      />

      <div className="skill-legend">
        <div className="legend-title">SYSTEM_MAP</div>
        {skillList.map((skill) => (
          <button
            key={skill.id}
            type="button"
            className="legend-item"
            aria-pressed={selectedSkill === skill.id}
            onMouseEnter={() => handlePartHover(skill.id)}
            onMouseLeave={() => handlePartHover(null)}
            onClick={() => handlePartClick(skill.id)}
          >
            <span className="legend-part">{skill.part}</span>
            <span className="legend-arrow">→</span>
            <span className="legend-skill">{skill.name}</span>
          </button>
        ))}
      </div>

      <div className="controls-hint">
        <div className="hint-item">[HOVER] Scan</div>
        <div className="hint-item">[CLICK] Analyze</div>
        <div className="hint-item">[ESC] Reset</div>
      </div>
    </div>
  );
};

export default App;
