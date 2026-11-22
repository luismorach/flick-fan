import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ProbeResult, MediaEvaluation } from '../../../interfaces/media-evaluation/media-evaluation.interface';
import { environment } from '../../../environment/environment';
import { ParamsApi } from '../../../interfaces/shared/params-http.interface';
import { Torrent } from '../../../interfaces/stream/stream.interface';
import { PlaybackService } from '../../player/playback/playback.service.service';

@Injectable({
  providedIn: 'root'
})
export class StreamApiServiceService {
  private http = inject(HttpClient)
  private playbackService = inject(PlaybackService)
  private readonly API_BASE_STREAM = environment.stream.API_URL;
  private readonly URL_TORRENTS = environment.stream.URL_TORRENTS;

  getTorrents(params: ParamsApi) {
    const endpoint = `${this.URL_TORRENTS}/${params.type}/${params.dataId}.json`
    return this.http.get<Torrent>(endpoint)
  }

  getInfoMedia(infoHash: string) {
    const endpoint = `${this.API_BASE_STREAM}/stream/analyze`
    const headers = this.playbackService.getHeaders()
    return this.http.post(endpoint,
      { infoHash },
      { 
        headers:headers,
        withCredentials: true 
      }
    ) as Observable<{ analysisId: number, type: string, info: ProbeResult }>
  }

  processStream(analysisId: number, evaluation: MediaEvaluation) {
    const endpoint = `${this.API_BASE_STREAM}/stream/process`
    const body = { analysisId, evaluation }
    const headers = this.playbackService.getHeaders()
    return this.http.post(endpoint, body, {
      headers: headers,
      withCredentials: true
    }
    ).pipe(
      map(response => ({
        ...response,
        analysisId,
        evaluation
      }))
    )
  }
}
