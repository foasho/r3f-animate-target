import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useHelper } from "@react-three/drei";
import { useSpring, animated, config } from '@react-spring/three'
import { BoxHelper, Mesh, Vector3 } from "three";
import { useRef, useState } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

function App() {
  const orbit = useRef<OrbitControlsImpl>(null);
  return (
    <div style={{ height: "100dvh", width: "100dvw" }}>
      <Canvas shadows>
        <ambientLight intensity={1}/>
        <pointLight position={[3, 3, 3]}/>
        <directionalLight position={[-2, 3, 5]}/>
        <Box position={[0, 0, 0]}/>
        <TargetPoint
          visible={true}
          position={[2, 2, 2]}
          lookAt={[0, 0, 0]}
          orbit={orbit}
        />
        <TargetPoint
          visible={true}
          position={[1, 0, -1]}
          lookAt={[0, 1, 0]}
          speed={0.05}
          orbit={orbit}
        />
        <TargetPoint
          visible={true}
          position={[-1, -1, 2]}
          lookAt={[1, 0, 1]}
          orbit={orbit}
        />
        <OrbitControls ref={orbit}/>
      </Canvas>
    </div>
  )
}

type BoxProps = {
  position: [number, number, number] | Vector3;
}
const Box = (
  { position }: BoxProps
) => {

  const ref = useRef<Mesh>(null);
  const [active, setActive] = useState(false);

  const { scale } = useSpring({
    scale: active ? 1.5 : 1,
    config: config.wobbly
  });

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta;
      ref.current.rotation.y += delta;
    }
  });

  return (
    <animated.mesh ref={ref} scale={scale} onClick={() => setActive(!active)} position={position}>
      <boxGeometry args={[1, 1, 1]}/>
      <meshStandardMaterial color="hotpink"/>
    </animated.mesh>
  )
}

const getVec3 = (vec: [number, number, number] | Vector3): Vector3 => {
  if (Array.isArray(vec)) {
    return new Vector3(
      vec[0],
      vec[1],
      vec[2]
    );
  }
  return vec;
}

/**
 * TargetPoint
 */
type TargetPointProps = {
  visible: boolean;
  position: [number, number, number] | Vector3;
  lookAt: [number, number, number] | Vector3;
  speed?: number;
  fps?: number;
  orbit?: React.MutableRefObject<OrbitControlsImpl | null> | undefined;
}
const TargetPoint = (
  {
    visible,
    position,
    lookAt,
    speed = 0.1,
    fps = 60,
    orbit,
  }: TargetPointProps
) => {

  const pos = getVec3(position);
  const lkAt = getVec3(lookAt);

  const three = useThree();
  const ref = useRef<Mesh>(null);

  useHelper(visible && ref, BoxHelper);

  const moveCamera = () => {
    const distance = three.camera.position.distanceTo(pos);
    const forNum = Math.floor(distance / speed);
    for (let i = 0; i < forNum; i++) {
      setTimeout(() => {
        // lerpでpositionまで移動する
        three.camera.position.lerp(pos, speed);
        three.camera.lookAt(lkAt);
        if (orbit && orbit.current) {
          orbit.current.target.copy(lkAt);
          orbit.current.update();
        }
      }, 1000 / fps * i);
    }
  };

  return (
    <mesh 
      ref={ref} 
      visible={false} 
      position={position}
      onClick={moveCamera}
    >
      <boxGeometry args={[1, 1, 1]}/>
      <meshStandardMaterial color="hotpink"/>
    </mesh>
  )
}

export default App
