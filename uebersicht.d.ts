interface Props {
  output: string;
  error: string;
}

declare module "uebersicht" {
  import ReactModule from "react";
  import { CreateStyled } from "@emotion/styled/types/base";
  import { css as EmotionCss } from "@emotion/react";
  import { SuperAgentStatic } from "superagent";

  type runCallback<R = void> = (error: Error | null, message?: string) => R;

  export function run(command: string): Promise<string>;
  export function run<R>(command: string, callback: runCallback<R>): Promise<R>;

  export const React: typeof ReactModule;
  export const css: typeof EmotionCss;
  export const styled: CreateStyled;
  export const request: SuperAgentStatic;
}
