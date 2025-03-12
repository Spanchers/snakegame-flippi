import { Canvas } from '@react-three/fiber';
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { OrbitControls } from '@react-three/drei';
import Bird from './components/Bird'; // 3D-модель птицы
import Pipe from './components/Pipe'; // 3D-модель трубы

const GRAVITY = 1.5;
const JUMP_STRENGTH = 20;
const PIPE_GAP = 150;
const PIPE_SPEED = 5;

export default function FlappyBird() {
  const [birdY, setBirdY] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([{ x: 10, height: 2 }]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameRef = useRef(null);

  useEffect(() => {
    if (isGameOver) return;
    
    const gameLoop = setInterval(() => {
      setVelocity((v) => v + GRAVITY * 0.05);
      setBirdY((y) => y + velocity * 0.05);
      setPipes((pipes) =>
        pipes.map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED * 0.05 }))
          .filter((pipe) => pipe.x > -5)
      );
    }, 30);

    return () => clearInterval(gameLoop);
  }, [velocity, isGameOver]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPipes((pipes) => [...pipes, { x: 10, height: Math.random() * 2 + 1 }]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleJump = () => {
    if (!isGameOver) {
      setVelocity(-JUMP_STRENGTH * 0.05);
    } else {
      setBirdY(0);
      setVelocity(0);
      setPipes([{ x: 10, height: 2 }]);
      setScore(0);
      setIsGameOver(false);
    }
  };

  useEffect(() => {
    pipes.forEach((pipe) => {
      if (
        pipe.x < 0.5 && pipe.x > -0.5 &&
        (birdY < pipe.height || birdY > pipe.height + PIPE_GAP * 0.01)
      ) {
        setIsGameOver(true);
      }
      if (pipe.x === 0) {
        setScore((s) => s + 1);
      }
    });
    if (birdY >= 5 || birdY <= -5) setIsGameOver(true);
  }, [birdY, pipes]);

  return (
    <div ref={gameRef} className="w-full h-screen" onClick={handleJump}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <OrbitControls enableZoom={false} />
        <Bird position={[0, birdY, 0]} />
        {pipes.map((pipe, index) => (
          <Pipe key={index} position={[pipe.x, pipe.height, 0]} />
        ))}
      </Canvas>
      <div className="absolute top-4 left-4 text-white text-xl font-bold">Score: {score}</div>
      {isGameOver && <div className="absolute inset-0 flex justify-center items-center text-3xl text-red-500 font-bold">Game Over</div>}
    </div>
  );
}
