import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

interface ShootingControllerProps {
  targets: Array<{ id: number; x: number; y: number; size: number }>;
  onTargetHit: (targetId: number) => void;
  isPaused: boolean;
}

export function ShootingController({ targets, onTargetHit, isPaused }: ShootingControllerProps) {
  const { camera, scene } = useThree();

  useEffect(() => {
    const handleClick = () => {
      if (isPaused || !document.pointerLockElement) return;

      // Create a raycaster from the center of the screen (where crosshair is)
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

      // Find all target meshes in the scene
      const targetMeshes: THREE.Object3D[] = [];
      scene.traverse((object) => {
        if (object.userData.isTarget) {
          targetMeshes.push(object);
        }
      });

      // Check for intersections
      const intersects = raycaster.intersectObjects(targetMeshes, true);
      
      if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        const targetId = hitObject.userData.targetId;
        if (targetId !== undefined) {
          onTargetHit(targetId);
        }
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [camera, scene, targets, onTargetHit, isPaused]);

  return null;
}
