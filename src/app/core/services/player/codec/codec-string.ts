import { Injectable } from '@angular/core';
import { AudioTrack, VideoInfo } from '../../../interfaces/media-evaluation/media-evaluation.interface';

export type OutputContainer = 'mp4' | 'webm';

@Injectable({ providedIn: 'root' })
export class CodecStringService {

    // ───────────────────────── VIDEO ─────────────────────────

    getVideoCodec(video: VideoInfo, container: OutputContainer = 'mp4'): string | null {
        switch (video.codec.toLowerCase()) {
            case 'h264':
            case 'avc':
                return container === 'mp4' ? this.getAvcCodec(video) : null;

            case 'hevc':
            case 'h265':
                return container === 'mp4' ? this.getHevcCodec(video, 'hvc1') : null;

            case 'av1':
                return this.getAv1Codec(video);

            // VP9 es válido en mp4 y webm
            case 'vp9':
                return this.getVp9Codec(video);

            case 'vp8':
                return container === 'webm' ? 'vp8' : null;

            default:
                return null;
        }
    }

    // ───────────────────────── AUDIO ─────────────────────────

    getAudioCodec(audio: AudioTrack, container: OutputContainer = 'mp4'): string | null {
        const codec = audio.codec.toLowerCase();

        if (container === 'webm') {
            return ({ opus: 'opus', vorbis: 'vorbis' } as Record<string, string>)[codec] ?? null;
        }

        // mp4
        switch (codec) {
            case 'aac': return this.getAacCodec(audio);
            case 'mp3': return 'mp3';
            case 'ac3': return 'ac-3';
            case 'eac3': return 'ec-3';
            case 'opus': return 'opus';
            case 'flac': return 'flac';
            case 'alac': return 'alac';
            default: return null;
        }
    }

    /** MediaCapabilities espera "2", "5.1", "7.1", no el número de canales. */
    formatChannels(channels?: number): string {
        switch (channels) {
            case undefined:
            case 0: return '2';
            case 6: return '5.1';
            case 8: return '7.1';
            default: return String(channels);
        }
    }

    /** Campos opcionales de color/HDR para MediaDecodingConfiguration.video. */
    getVideoColorInfo(video: VideoInfo): {
        colorGamut?: 'srgb' | 'p3' | 'rec2020';
        transferFunction?: 'srgb' | 'pq' | 'hlg';
        hdrMetadataType?: 'smpteSt2086';
    } {
        const primaries = video.colorPrimaries?.toLowerCase() ?? '';
        const transfer = video.colorTransfer?.toLowerCase() ?? '';

        const colorGamut =
            primaries === 'bt2020' ? 'rec2020' :
            primaries.includes('smpte431') || primaries.includes('smpte432') ? 'p3' :
            'srgb';

        if (transfer === 'smpte2084') {
            return { colorGamut, transferFunction: 'pq', hdrMetadataType: 'smpteSt2086' };
        }
        if (transfer === 'arib-std-b67') {
            return { colorGamut, transferFunction: 'hlg', hdrMetadataType: 'smpteSt2086' };
        }
        return { colorGamut, transferFunction: 'srgb' };
    }

    // ───────────────────────── H.264 ─────────────────────────

    private getAvcCodec(video: VideoInfo): string | null {
        const bytes = this.parseExtradata(video.extradata);

        if (bytes) {
            // avcC (AVCDecoderConfigurationRecord)
            if (bytes.length >= 4 && bytes[0] === 1) {
                return this.formatAvc(bytes[1], bytes[2], bytes[3]);
            }

            // Annex B (SPS con start code): header, profile, compat, level
            const sps = this.findAnnexBNal(bytes, 7);
            if (sps && sps.length >= 4) {
                return this.formatAvc(sps[1], sps[2], sps[3]);
            }
        }

        return this.getAvcFromProbe(video);
    }

    private formatAvc(profile: number, compat: number, level: number): string {
        const hex = (n: number) => n.toString(16).padStart(2, '0');
        return `avc1.${hex(profile)}${hex(compat)}${hex(level)}`;
    }

    // Respaldo cuando no hay extradata: usa profile/level que reporta ffprobe.
    private getAvcFromProbe(video: VideoInfo): string | null {
        const profiles: Record<string, [number, number]> = {
            'baseline': [0x42, 0x00],
            'constrained baseline': [0x42, 0xe0],
            'main': [0x4d, 0x40],
            'extended': [0x58, 0x00],
            'high': [0x64, 0x00],
            'high 10': [0x6e, 0x00],
            'high 4:2:2': [0x7a, 0x00],
            'high 4:4:4 predictive': [0xf4, 0x00],
        };

        const entry = profiles[video.profile?.trim().toLowerCase() ?? ''];
        const level = video.level;

        if (!entry || !level || level < 1 || level > 255) return null;

        return this.formatAvc(entry[0], entry[1], level);
    }

    private findAnnexBNal(bytes: Uint8Array, nalType: number): Uint8Array | null {
        for (let i = 0; i + 3 < bytes.length; i++) {
            if (bytes[i] === 0 && bytes[i + 1] === 0 && bytes[i + 2] === 1) {
                if ((bytes[i + 3] & 0x1f) === nalType) {
                    return bytes.subarray(i + 3);
                }
            }
        }
        return null;
    }

    // ───────────────────────── HEVC ─────────────────────────

    private getHevcCodec(video: VideoInfo, sampleEntry: 'hvc1' | 'hev1'): string | null {
        const bytes = this.parseExtradata(video.extradata);

        if (!bytes || bytes.length < 13 || bytes[0] !== 1) {
            return this.getHevcFromProbe(video, sampleEntry);
        }

        const profileByte = bytes[1];
        const profileSpace = profileByte >> 6;
        const tierFlag = (profileByte >> 5) & 1;
        const profileIdc = profileByte & 0x1f;

        // Compatibility flags: 32 bits invertidos y en HEXADECIMAL
        const compat = new DataView(bytes.buffer, bytes.byteOffset + 2, 4).getUint32(0, false);
        let reversed = 0;
        for (let i = 0; i < 32; i++) {
            if (compat & (1 << i)) reversed |= 1 << (31 - i);
        }
        const compatHex = (reversed >>> 0).toString(16).toUpperCase();

        // Constraint flags: cada byte en hex, separados por ".", sin ceros finales
        const constraints = Array.from(bytes.slice(6, 12)).map(b => b.toString(16).toUpperCase());
        while (constraints.length && constraints[constraints.length - 1] === '0') {
            constraints.pop();
        }

        const level = bytes[12];
        const spacePrefix = ['', 'A', 'B', 'C'][profileSpace];

        return [
            `${sampleEntry}.${spacePrefix}${profileIdc}`,
            compatHex,
            `${tierFlag ? 'H' : 'L'}${level}`,
            ...(constraints.length ? constraints : ['B0'])
        ].join('.');
        // ejemplo: hvc1.1.6.L93.B0
    }

    private getHevcFromProbe(video: VideoInfo, sampleEntry: 'hvc1' | 'hev1'): string | null {
        const level = video.level;
        if (!level || level < 1) return null;

        const profile = video.profile?.trim().toLowerCase();

        if (profile === 'main') return `${sampleEntry}.1.6.L${level}.B0`;
        if (profile === 'main 10') return `${sampleEntry}.2.4.L${level}.B0`;

        return null;
    }

    // ───────────────────────── AV1 ─────────────────────────

    private getAv1Codec(video: VideoInfo): string | null {
        const bytes = this.parseExtradata(video.extradata);

        if (!bytes || bytes.length < 3) return null;

        // marker = 1, version = 1
        if ((bytes[0] & 0x80) === 0 || (bytes[0] & 0x7f) !== 1) return null;

        const profile = (bytes[1] >> 5) & 0x07;
        const level = bytes[1] & 0x1f;
        const tier = (bytes[2] >> 7) & 0x01;
        const highBitDepth = (bytes[2] >> 6) & 0x01;
        const twelveBit = (bytes[2] >> 5) & 0x01;

        const bitDepth = highBitDepth ? (profile === 2 && twelveBit ? 12 : 10) : 8;

        return `av01.${profile}.${this.pad2(level)}${tier ? 'H' : 'M'}.${this.pad2(bitDepth)}`;
    }

    // ───────────────────────── VP9 ─────────────────────────

    private getVp9Codec(video: VideoInfo): string | null {
        const bitDepth = this.getBitDepth(video);
        const profile = this.getVp9Profile(video, bitDepth);
        const level = this.getVp9Level(video);

        return `vp09.${this.pad2(profile)}.${this.pad2(level)}.${this.pad2(bitDepth)}`;
    }

    private getVp9Profile(video: VideoInfo, bitDepth: number): number {
        const match = video.profile?.match(/profile\s*(\d)/i);
        if (match && [0, 1, 2, 3].includes(Number(match[1]))) {
            return Number(match[1]);
        }

        // Deducir desde el pixel format
        const non420 = /444|422|440/.test(video.pixFmt ?? '');
        if (non420) return bitDepth > 8 ? 3 : 1;
        return bitDepth > 8 ? 2 : 0;
    }

    // ffprobe suele reportar -99 en VP9: se estima por resolución.
    private getVp9Level(video: VideoInfo): number {
        const valid = [10, 11, 20, 21, 30, 31, 40, 41, 50, 51, 52, 60, 61, 62];
        if (video.level != null && valid.includes(video.level)) return video.level;

        const pixels = (video.width ?? 1920) * (video.height ?? 1080);
        if (pixels <= 245_760) return 21;
        if (pixels <= 552_960) return 30;
        if (pixels <= 983_040) return 31;
        if (pixels <= 2_228_224) return 41;
        if (pixels <= 8_912_896) return 51;
        return 62;
    }

    private getBitDepth(video: VideoInfo): number {
        const raw = Number(video.bitsPerRawSample);
        if ([8, 10, 12].includes(raw)) return raw;

        const match = video.pixFmt?.match(/p(\d{2})(?:le|be)?$/i);
        if (match) return Number(match[1]);

        return video.pixFmt?.includes('10') ? 10 : 8;
    }

    // ───────────────────────── AAC ─────────────────────────

    private getAacCodec(audio: AudioTrack): string | null {
        // 1) Perfil informado por ffprobe (el más fiable para HE-AAC, donde
        //    SBR/PS son implícitos y no aparecen en el AudioSpecificConfig)
        const profile = audio.profile?.toLowerCase() ?? '';

        if (profile.includes('he-aac v2') || profile.includes('he-aacv2')) return 'mp4a.40.29';
        if (profile.includes('he-aac') || profile.includes('aac he')) return 'mp4a.40.5';
        if (profile.includes('xhe')) return 'mp4a.40.42';
        if (profile.includes('main')) return 'mp4a.40.1';
        if (profile.includes('lc') || profile.includes('low complexity')) return 'mp4a.40.2';

        // 2) AudioSpecificConfig: los primeros 5 bits son el audioObjectType
        const bytes = this.parseExtradata(audio.extradata);
        if (bytes && bytes.length >= 2) {
            const aot = bytes[0] >> 3;
            if ([1, 2, 5, 29, 42].includes(aot)) return `mp4a.40.${aot}`;
        }

        // No asumir un perfil si no hay información.
        return null;
    }

    // ───────────────────────── Utilidades ─────────────────────────

    private pad2(n: number): string {
        return n.toString().padStart(2, '0');
    }

    /**
     * Convierte el volcado de ffprobe a bytes. Acepta:
     *  - formato "00000000: 0164 0028 ...  ascii"
     *  - hex plano ("01640028ffe1...")
     */
    private parseExtradata(dump?: string): Uint8Array | null {
        if (!dump) return null;

        const bytes: number[] = [];
        let sawDumpLine = false;

        for (const line of dump.split(/\r?\n/)) {
            const match = line.match(/^\s*[0-9a-f]+:\s*(.*)$/i);
            if (!match) continue;

            sawDumpLine = true;

            // Separa los datos hexadecimales de la columna ASCII.
            const hexPart = match[1].split(/\s{2,}/)[0];

            for (const word of hexPart.trim().split(/\s+/)) {
                if (!/^(?:[0-9a-f]{4}|[0-9a-f]{2})$/i.test(word)) continue;

                for (let i = 0; i < word.length; i += 2) {
                    bytes.push(parseInt(word.slice(i, i + 2), 16));
                }
            }
        }

        if (!sawDumpLine) {
            const compact = dump.replace(/\s+/g, '');
            if (/^(?:[0-9a-f]{2})+$/i.test(compact)) {
                for (let i = 0; i < compact.length; i += 2) {
                    bytes.push(parseInt(compact.slice(i, i + 2), 16));
                }
            }
        }

        return bytes.length ? Uint8Array.from(bytes) : null;
    }
}