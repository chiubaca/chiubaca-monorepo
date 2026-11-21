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

const overviewPosition = new Vector3(0, 3, 10);
const overviewTarget = new Vector3(0, 2, 0);

export const CameraController: React.FC<CameraControllerProps> = ({
  targetSkill,
  defaultPosition = overviewPosition,
  defaultTarget = overviewTarget,
}) => {
  const camera = useThree((state) => state.camera);
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height));
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
    const fit = Math.max(1, Math.min(1.4, 0.66 / aspect));
    const position = targetLookAt.clone().lerp(targetPos, fit);
    const immediate = matchMedia("(prefers-reduced-motion: reduce)").matches;
    void api.start({
      position: [position.x, position.y, position.z],
      immediate,
    });
    void lookAtApi.start({
      lookAt: [targetLookAt.x, targetLookAt.y, targetLookAt.z],
      immediate,
    });
  }, [aspect, targetPos, targetLookAt, api, lookAtApi]);

  useFrame(() => {
    const [x, y, z] = position.get();
    camera.position.set(x, y, z);

    const [lx, ly, lz] = lookAt.get();
    lookAtRef.current.set(lx, ly, lz);
    camera.lookAt(lookAtRef.current);
  });

  return null;
};
