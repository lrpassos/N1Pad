export interface NoteImage {
  id: string;
  url: string; // Current image URL (annotated or original)
  originalUrl?: string; // Backup of the initial un-annotated image
  name: string;
  size: number;
  annotatedAt?: string;
  history?: string[]; // Saved history of annotated versions
}

export interface Note {
  id: string;
  title: string;
  content: string;
  images: NoteImage[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  tags?: string[];
}

export type AnnotationTool = 'arrow' | 'rect' | 'highlight' | 'text' | 'pen';

export interface Point {
  x: number;
  y: number;
}

export interface AnnotationItem {
  id: string;
  tool: AnnotationTool;
  color: string;
  strokeWidth: number;
  points: Point[]; // For arrow: [start, end], for rect: [start, end], for pen/highlight: multiple points
  text?: string; // For text tool
  fontSize?: number;
  fill?: boolean; // For rect highlight
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  isGuest?: boolean;
}
