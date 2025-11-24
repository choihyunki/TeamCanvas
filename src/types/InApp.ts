export type ToolType =
  | "calculator"
  | "memo"
  | "timer"
  | "youtube"
  | "code-review";

export interface AppWindow {
  id: number;
  type: ToolType;
  title: string;
  x: number; // 창의 가로 위치
  y: number; // 창의 세로 위치
  zIndex: number; // 창이 겹칠 때 순서
  minimized: boolean;
  width: number;
  height: number;
}
