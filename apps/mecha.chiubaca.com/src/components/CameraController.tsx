import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useSpring, config } from "@react-spring/three";
import { Skill } from "../data/skills";

interface CameraControllerProps {
  targetSkill: Skill | null;
  defaultPosition?: Vector3;
  defaultTarget?: Vector3;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  targetSkill,
  defaultPosition = new Vector3(0, 3, 10),
  defaultTarget = new Vector3(0, 2, 0),
}) => {
  const { camera } = useThree();
  const lookAtRef = useRef(new Vector3());

  const targetPos = targetSkill ? targetSkill.cameraPosition : defaultPosition;
  const targetLookAt = targetSkill ? targetSkill.cameraTarget : defaultTarget;

  const [{ position }, api] = useSpring(() => ({
    position: [defaultPosition.x, defaultPosition.y, defaultPosition.z],
    config: { ...config.slow, tension: 40, friction: 25 },
  }));

  const [{ lookAt }, lookAtApi] = useSpring(() => ({
    lookAt: [defaultTarget.x, defaultTarget.y, defaultTarget.z],
    config: { ...config.slow, tension: 40, friction: 25 },
  }));

  useEffect(() => {
    void api.start({
      position: [targetPos.x, targetPos.y, targetPos.z],
    });
    void lookAtApi.start({
      lookAt: [targetLookAt.x, targetLookAt.y, targetLookAt.z],
    });
  }, [targetSkill, targetPos, targetLookAt, api, lookAtApi]);

  useFrame(() => {
    const [x, y, z] = position.get();
    camera.position.set(x, y, z);

    const [lx, ly, lz] = lookAt.get();
    lookAtRef.current.set(lx, ly, lz);
    camera.lookAt(lookAtRef.current);
  });

  return null;
};
