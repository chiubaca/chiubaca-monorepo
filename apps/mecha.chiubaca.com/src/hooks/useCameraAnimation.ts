import { useRef, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useSpring, config } from "@react-spring/three";

interface CameraAnimation {
  position: Vector3;
  target: Vector3;
}

export const useCameraAnimation = () => {
  const { camera } = useThree();
  const targetRef = useRef(new Vector3(0, 0, 0));
  const isAnimatingRef = useRef(false);

  const [{ pos }, api] = useSpring(() => ({
    pos: [0, 0, 10],
    config: { ...config.slow, tension: 60, friction: 20 },
  }));

  const animateTo = useCallback(
    (animation: CameraAnimation) => {
      isAnimatingRef.current = true;
      targetRef.current.copy(animation.target);

      void api.start({
        pos: [animation.position.x, animation.position.y, animation.position.z],
        onRest: () => {
          isAnimatingRef.current = false;
        },
      });
    },
    [api],
  );

  const reset = useCallback(() => {
    isAnimatingRef.current = true;
    targetRef.current.set(0, 0, 0);

    void api.start({
      pos: [0, 2, 8],
      onRest: () => {
        isAnimatingRef.current = false;
      },
    });
  }, [api]);

  useFrame(() => {
    if (camera) {
      const [x, y, z] = pos.get();
      camera.position.set(x, y, z);
      camera.lookAt(targetRef.current);
    }
  });

  return {
    animateTo,
    reset,
    isAnimating: () => isAnimatingRef.current,
    target: targetRef.current,
  };
};
