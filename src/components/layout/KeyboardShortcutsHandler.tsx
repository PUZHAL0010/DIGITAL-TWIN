import React, { useEffect } from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';

export const KeyboardShortcutsHandler: React.FC = () => {
  const setCameraPreset = useSimulationStore(state => state.setCameraPreset);
  const resetCamera = useSimulationStore(state => state.resetCamera);
  const focusComponent = useSimulationStore(state => state.focusComponent);
  const timeline = useSimulationStore(state => state.timeline);
  const playTimeline = useSimulationStore(state => state.playTimeline);
  const pauseTimeline = useSimulationStore(state => state.pauseTimeline);
  const isPresentationMode = useSimulationStore(state => state.isPresentationMode);
  const setPresentationMode = useSimulationStore(state => state.setPresentationMode);
  const setNavDrawer = useSimulationStore(state => state.setNavDrawer);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input fields or textareas
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      switch (e.key) {
        case '1':
          e.preventDefault();
          setCameraPreset('FRONT');
          break;
        case '2':
          e.preventDefault();
          setCameraPreset('BACK');
          break;
        case '3':
          e.preventDefault();
          setCameraPreset('LEFT');
          break;
        case '4':
          e.preventDefault();
          setCameraPreset('RIGHT');
          break;
        case '5':
          e.preventDefault();
          setCameraPreset('TOP');
          break;
        case '6':
          e.preventDefault();
          setCameraPreset('BOTTOM');
          break;
        case '7':
          e.preventDefault();
          setCameraPreset('ISOMETRIC');
          break;
        case '8':
          e.preventDefault();
          setCameraPreset('UNDER_DECK');
          break;
        case '9':
          e.preventDefault();
          setCameraPreset('UNDERWATER');
          break;
        case '0':
          e.preventDefault();
          setCameraPreset('FREE');
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          setCameraPreset('DRONE_INSPECTION');
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          resetCamera();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          focusComponent();
          break;
        case ' ':
          e.preventDefault();
          if (timeline.isPlaying) pauseTimeline();
          else playTimeline();
          break;
        case 'Escape':
          e.preventDefault();
          if (isPresentationMode) {
            setPresentationMode(false);
          }
          setNavDrawer(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setCameraPreset, resetCamera, focusComponent, timeline.isPlaying, playTimeline, pauseTimeline, isPresentationMode, setPresentationMode, setNavDrawer]);

  return null;
};
