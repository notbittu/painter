export interface DrawingSettings {
  color: string;
  brushSize: number;
  tool: 'brush' | 'eraser';
}

export interface CanvasState {
  lines: {
    tool: 'brush' | 'eraser';
    points: number[];
    color: string;
    brushSize: number;
  }[];
  currentLine: {
    tool: 'brush' | 'eraser';
    points: number[];
    color: string;
    brushSize: number;
  } | null;
}

export interface AppErrorState {
  hasError: boolean;
  message: string;
}

export interface Image {
  id: string;
  dataUrl: string;
  thumbnail?: string;
  createdAt: Date;
} 