import * as THREE from "three";
import { WorkTimelinePoint } from "../types";

export const WORK_TIMELINE: WorkTimelinePoint[] = [
  {
    point: new THREE.Vector3(0, 0, 0),
    year: '2023',
    title: 'Lovely Professional University',
    subtitle: 'Computer Science Engineering',
    position: 'right',
  },
  {
    point: new THREE.Vector3(-4, -4, -3),
    year: '2025',
    title: 'Edunet',
    subtitle: 'ML Intern',
    position: 'left',
  },
  {
    point: new THREE.Vector3(-3, -1, -6),
    year: '2025',
    title: 'Sure ProEd',
    subtitle: 'DS Intern',
    position: 'left',
  },
  {
    point: new THREE.Vector3(0, -1, -10),
    year: '2025',
    title: 'YugaYatra Retail',
    subtitle: 'SDE Intern',
    position: 'left',
  },
  {
    point: new THREE.Vector3(0.5, 0, -11),
    year: '2026',
    title: 'Infosys',
    subtitle: 'ML Intern',
    position: 'right',
  },
  {
    point: new THREE.Vector3(1, 1, -12),
    year: new Date().toLocaleDateString('default', { year: 'numeric' }),
    title: '?',
    subtitle: 'Busy cooking up',
    position: 'right',
  }
]