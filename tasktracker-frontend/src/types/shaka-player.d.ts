declare module "shaka-player/dist/shaka-player.compiled" {
    export interface ShakaError {
        category: string;
        code: number;
        severity: string;
        message: string;
    }

    export interface ShakaPlayer {
        load(manifestUri: string): Promise<void>;
        addEventListener(
            type: "error" | "buffering" | string,
            listener: (event: { detail?: ShakaError }) => void
        ): void;
        removeEventListener(
            type: string,
            listener: (event: { detail?: ShakaError }) => void
        ): void;

        attach(video: HTMLVideoElement): Promise<void>; // NEW
        destroy(): Promise<void>; // NEW
    }

    export const Player: new () => ShakaPlayer;
    const shaka: { Player: typeof Player };
    export default shaka;
}
