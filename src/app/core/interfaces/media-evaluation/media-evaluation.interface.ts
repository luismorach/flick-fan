export interface SupportedMediaType {
    container: string;
    videoCodec: string;
    audioCodec?: string;
    mimeType: string;
}

export interface VideoInfo {
    codec: string;
    codecTag?: string;
    profile?: string;
    level?: number;
    pixFmt?: string;
    width?: number;
    height?: number;
    fps?: number;
    bitRate?: number;
    interlaced: boolean;
    hdr: boolean;
    colorSpace: string
    colorTransfer: string
    colorPrimaries: string,
    bitsPerRawSample: string
    extradata: string
}

export interface AudioTrack {
    streamIndex: number;
    audioIndex: number;
    codec: string;
    channels?: number;
    sampleRate?: number;
    bitRate?: number;
    language?: string;
    title?: string;
    isDefault: boolean;
    profile?: string,
    channelLayout?: string
    bitsPerSample?: number
    codecTag?: string
    extradata?: string
}

export interface SubtitleTrack {
    streamIndex: number;
    subIndex: number;    // índice relativo (s:N)
    codec: string;
    language?: string;
    title?: string;
    kind: 'text' | 'image'; // text → convertible a WebVTT; image → requiere quemarse en el video
}

export interface ProbeResult {
    container: string;
    durationSec: number | null;
    video: VideoInfo | null;
    audioTracks: AudioTrack[];
    subtitleTracks: SubtitleTrack[];
}

export interface MediaCapabilityResult {
  type: 'video' | 'audio';
  streamIndex?: number;

  codec: string;
  supported: boolean;
  smooth: boolean;
  powerEfficient: boolean;

  action?: 'copy' | 'transcode';
}

export interface MediaEvaluation {
  video: MediaCapabilityResult | null;
  audio: MediaCapabilityResult[];
}