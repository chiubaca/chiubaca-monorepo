import React from "react";
import { skillList } from "../data/skillConfig";

interface MobileSkillsPanelProps {
  selectedSkill: string | null;
  hoveredSkill: string | null;
  onSkillSelect: (skillId: string) => void;
  onSkillHover: (skillId: string | null) => void;
}

export const MobileSkillsPanel: React.FC<MobileSkillsPanelProps> = ({
  selectedSkill,
  hoveredSkill,
  onSkillSelect,
  onSkillHover,
}) => {
  const handleSkillClick = (skillId: string) => {
    onSkillSelect(skillId);
  };

  return (
    <div className="mobile-skills-panel">
      <div className="mobile-skills-scroll">
        {skillList.map((skill) => {
          const isActive = selectedSkill === skill.id;
          const isHovered = hoveredSkill === skill.id;

          return (
            <button
              key={skill.id}
              className={`mobile-skill-btn ${isActive ? "active" : ""} ${isHovered ? "hovered" : ""}`}
              onClick={() => handleSkillClick(skill.id)}
              onMouseEnter={() => onSkillHover(skill.id)}
              onMouseLeave={() => onSkillHover(null)}
            >
              <span className="skill-btn-label">{skill.label}</span>
              <span className="skill-btn-part">{skill.part}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
