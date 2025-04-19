declare module 'react-dom/client' {
  interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }

  export function createRoot(
    container: Element | DocumentFragment,
    options?: {
      identifierPrefix?: string;
      onRecoverableError?: (error: unknown) => void;
    }
  ): Root;
} 