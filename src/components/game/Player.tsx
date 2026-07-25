import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMultiplayer } from '@/hooks/useMultiplayer';

interface PlayerProps {
  isLocalPlayer?: boolean;
  playerData?: any;
  gameId: string;
}

export default function Player({ isLocalPlayer = true, playerData, gameId }: PlayerProps) {
  const playerRef = useRef<any>(new THREE.Group());
  const { camera } = useThree();
  const { updatePosition } = useMultiplayer(gameId);
  
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });

  const velocity = useRef(new THREE.Vector3());
  const isGrounded = useRef(true);
  const jumpVelocity = useRef(0);

  // For remote players, just update position from data
  useEffect(() => {
    if (!isLocalPlayer && playerData && playerRef.current) {
      playerRef.current.position.set(
        playerData.position_x,
        playerData.position_y,
        playerData.position_z
      );
      playerRef.current.rotation.y = playerData.rotation_y;
    }
  }, [playerData, isLocalPlayer]);

  useEffect(() => {
    if (!isLocalPlayer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'Space':
          if (isGrounded.current) {
            jumpVelocity.current = 8;
            isGrounded.current = false;
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isLocalPlayer]);

  useFrame((state, delta) => {
    if (!isLocalPlayer) return;

    const speed = 5;
    const direction = new THREE.Vector3();

    if (keys.current.forward) direction.z -= 1;
    if (keys.current.backward) direction.z += 1;
    if (keys.current.left) direction.x -= 1;
    if (keys.current.right) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize();
      direction.applyQuaternion(camera.quaternion);
      direction.y = 0;
      direction.normalize();
    }

    velocity.current.x = direction.x * speed;
    velocity.current.z = direction.z * speed;

    // Apply gravity
    if (!isGrounded.current) {
      jumpVelocity.current -= 20 * delta;
    }

    velocity.current.y = jumpVelocity.current;

    // Update position
    playerRef.current.position.x += velocity.current.x * delta;
    playerRef.current.position.z += velocity.current.z * delta;
    playerRef.current.position.y += velocity.current.y * delta;

    // Ground collision
    if (playerRef.current.position.y <= 1) {
      playerRef.current.position.y = 1;
      jumpVelocity.current = 0;
      isGrounded.current = true;
    }

    // Update camera to follow player
    camera.position.x = playerRef.current.position.x;
    camera.position.z = playerRef.current.position.z + 10;
    camera.position.y = playerRef.current.position.y + 5;
    camera.lookAt(playerRef.current.position);

    // Update multiplayer position
    updatePosition(
      playerRef.current.position.x,
      playerRef.current.position.y,
      playerRef.current.position.z,
      playerRef.current.rotation.y,
      !isGrounded.current
    );
  });

  const avatarColor = playerData?.avatar_color || '#3b82f6';

  return (
    <group ref={playerRef} position={isLocalPlayer ? undefined : [playerData?.position_x, playerData?.position_y, playerData?.position_z]}>
      {/* Player body */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color={avatarColor} />
      </mesh>
      
      {/* Player head */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>

      {/* Username label */}
      {!isLocalPlayer && playerData?.username && (
        <mesh position={[0, 3.2, 0]}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}
