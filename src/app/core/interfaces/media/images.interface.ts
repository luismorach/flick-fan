export interface Images {
    id: number
    backdrops: Backdrop[]
    posters: Poster[]
    logos: Logo[]
}

interface Backdrop {
    aspect_ratio: number
    file_path: string
    height: number
    iso_639_1: string
    vote_average: number
    vote_count: number
    width: number
}
interface Poster {
    file_path: string
    aspect_ratio: number
    height: number
    iso_639_1: string
    vote_average: number
    vote_count: number
    width: number
    logo_path: string
}
interface Logo {
    file_path: string
    aspect_ratio: number
    height: number
    iso_639_1: string
    vote_average: number
    vote_count: number
    width: number
    logo_path: string
}