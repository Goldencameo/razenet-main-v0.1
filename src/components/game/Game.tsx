import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import Player from './Player';
import Ground from './Ground';
import GameUI from './GameUI';
import { useMultiplayer } from '@/hooks/useMultiplayer';

interface GameProps {
  gameId: string;
  onLeave: () => void;
}

export default function Game({ gameId, onLeave }: GameProps) {
  const { players } = useMultiplayer(gameId);

  return (
    <div className="fixed inset-0 bg-black">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Environment preset="sunset" />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          <Ground />
          <Player isLocalPlayer={true} gameId={gameId} />
          
          {players.map((player) => (
            <Player
              key={player.user_id}
              isLocalPlayer={false}
              playerData={player}
              gameId={gameId}
            />
          ))}
          
          <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
            minDistance={3}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
      
      <GameUI onLeave={onLeave} />
    </div>
  );
}
