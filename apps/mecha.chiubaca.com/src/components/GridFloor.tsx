import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { GridHelper, LineSegments, BufferGeometry, Float32BufferAttribute } from "three";

export const GridFloor: React.FC = () => {
  const gridRef = useRef<GridHelper>(null);
  const linesRef = useRef<LineSegments>(null);

  // Create perspective grid
  const perspectiveGrid = useMemo(() => {
    const geometry = new BufferGeometry();
    const vertices: number[] = [];
    const size = 40;
    const divisions = 40;
    const step = size / divisions;

    // Horizontal lines (perspective)
    for (let i = 0; i <= divisions; i++) {
      const z = -20 + i * step;
      const y = -3;
      vertices.push(-size / 2, y, z);
      vertices.push(size / 2, y, z);
    }

    // Vertical lines
    for (let i = 0; i <= divisions; i++) {
      const x = -size / 2 + i * step;
      const y = -3;
      vertices.push(x, y, -20);
      vertices.push(x, y, 20);
    }

    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      const time = state.clock.getElapsedTime();
      // Subtle grid animation
      linesRef.current.position.z = (time * 2) % 2;
    }
  });

  return (
    <>
      <gridHelper ref={gridRef} args={[40, 40, 0x003300, 0x001100]} position={[0, -3, 0]} />
      <lineSegments ref={linesRef} geometry={perspectiveGrid}>
        <lineBasicMaterial color={0x00ff41} transparent opacity={0.15} />
      </lineSegments>
    </>
  );
};
