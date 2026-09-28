const fs = require('fs');
let code = fs.readFileSync('src/scenes/LabScene.tsx', 'utf8');

const correctHook = `function useLayoutGuard() {
  const { scene } = useThree();
  const { stage } = useSimulationStore();
  
  useEffect(() => {
    // @ts-ignore
    if (import.meta.env.MODE !== 'development') return;
    const timeout = setTimeout(() => {
      const boxes = [];
      scene.traverse((child) => {
        if (child.name && (child.name.includes('Laptop') || child.name.includes('Tray') || child.name.includes('Table'))) {
          const box = new THREE.Box3().setFromObject(child);
          boxes.push({ name: child.name, box });
        }
      });
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          if (boxes[i].box.intersectsBox(boxes[j].box)) {
            const overlap = boxes[i].box.clone().intersect(boxes[j].box);
            const volume = (overlap.max.x - overlap.min.x) * (overlap.max.y - overlap.min.y) * (overlap.max.z - overlap.min.z);
            if (volume > 0.05) {
              console.warn('Layout Guard:', boxes[i].name, 'overlaps with', boxes[j].name, 'in stage', stage, 'Volume:', volume.toFixed(3));
            }
          }
        }
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [stage, scene]);
}`;

const pre = code.substring(0, code.indexOf('function useLayoutGuard() {'));
const post = code.substring(code.indexOf('function usePerformanceMonitor() {'));

fs.writeFileSync('src/scenes/LabScene.tsx', pre + correctHook + '\n\n' + post);
