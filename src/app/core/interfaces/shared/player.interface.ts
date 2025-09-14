import { WritableSignal } from "@angular/core";

export interface PlayerTrailer {
    videoId: WritableSignal<string>,
    isPlaying: boolean,
}
