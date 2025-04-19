declare module 'react-dom/client' {
  import { Root } from 'react-dom/client';
  export function createRoot(
    container: Element | DocumentFragment,
    options?: {
      identifierPrefix?: string;
      onRecoverableError?: (error: unknown) => void;
    }
  ): Root;
} 