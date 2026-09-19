/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { ThreeElements } from "@react-three/fiber";

declare module "@react-three/fiber" {
  interface CanvasProps {
    className?: string;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}
