import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class PlaybackService {

  private playbackId: string | null = null;

  createPlaybackId(): string {
    this.playbackId = crypto.randomUUID();
    return this.playbackId;
  }

  getPlaybackId(): string | null {
    return this.playbackId;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('sessionId', sessionId);
    }

    return sessionId;
  }

  getHeaders() {
    return new HttpHeaders({
      'X-Session-Id': this.getSessionId(),
      'X-Playback-Id': this.createPlaybackId()
    })
  }

}