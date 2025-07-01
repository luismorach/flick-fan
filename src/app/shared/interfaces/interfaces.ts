import { WritableSignal } from "@angular/core"

export interface listMovies {
    page: number
    results: Movie[]
    total_pages: number
    total_results: number
}

export interface Movie {
    adult: boolean
    backdrop_path: string
    genres: genre[]
    id: number
    original_language: string
    original_title: string
    overview: string
    popularity: number
    poster_path: string
    release_date: Date
    title: string
    videos: videos
    vote_average: number
    vote_count: number
    runtime: number
    status: string
    budget: number
    revenue: number
    homepage: string
    production_companies: production_companie[]
    production_countries: production_country[]
}

interface production_companie {
    id: number,
    logo_path: string,
    name: string,
    origin_country: string
}
interface production_country {
    iso_3166_1: string,
    name: string
}

export interface videos {
    results: {
        id: string
        iso_639_1: string
        iso_3166_1: string
        key: string
        name: string
        site: string
        size: number
        type: string
    }[]
}

export interface images{
    id: number
    backdrops: backdrops[]
    posters: posters[] 
    logos: logo[]
}

interface backdrops{
    aspect_ratio: number
    file_path: string
    height: number
    iso_639_1: string
    vote_average: number
    vote_count: number
    width: number
}
interface posters{
    file_path: string
    aspect_ratio: number
    height: number
    iso_639_1: string
    vote_average: number
    vote_count: number
    width: number
    logo_path: string
}
interface logo{
    file_path: string
    aspect_ratio: number
    height: number
    iso_639_1: string
    vote_average: number
    vote_count: number
    width: number
    logo_path: string
}

export interface genre {
    id: number
    name: string
}

export interface playerTrailer {
    videoId: WritableSignal<string>,
    isPlaying: boolean,
}

export interface Credits {
    cast: Cast[]
    crew: Crew[]
}

interface Cast {
    adult: boolean,
    gender: number,
    id: number,
    known_for_department: string,
    name: string,
    original_name: string,
    popularity: number,
    profile_path: string,
    cast_id: number,
    character: string,
    credit_id: string,
    order: number
}
interface Crew {
    adult: boolean,
    gender: number,
    id: number,
    known_for_department: string,
    name: string,
    original_name: string,
    popularity: number,
    profile_path: string,
    credit_id: string,
    department: string,
    job: string
}

export interface listSeries {
    page: number
    results: Serie[]
    total_pages: number
    total_results: number
}
export interface Serie {
    adult: boolean
    backdrop_path: string
    created_by: createdBy[]
    episode_run_time: number[]
    first_air_date: Date
    genres: genre[]
    homepage: string
    id: number
    in_production: boolean
    languages: string[]
    last_air_date: Date
    last_episode_to_air: last_episode_to_air
    name:string
    next_episode_to_air:string
    number_of_episodes:number
    number_of_seasons:number
    origin_country: string[]
    original_language: string
    original_name: string
    overview: string
    popularity: number
    poster_path: string
    production_companies: production_companie[]
    production_countries: production_country[]
    seasons: season[]
    status: string
    tagline: string
    type: string
    vote_average: number
    vote_count: number
    images: images
    videos:videos
}

interface createdBy {
    id: number
    credit_id: string
    name: string
    gender: number
    profile_path: string
}

interface last_episode_to_air {
    id: number
    name: string
    overview: string
    vote_average: number
    vote_count: number
    air_date: Date
    episode_number: number
    season_number: number
    production_code: string
    runtime: number
    show_id: number
    still_path: string
}

interface season{
    air_date: Date
    episode_count: number
    id: number
    name: string
    overview: string
    poster_path: string
    season_number: number
    vote_average: number
}
    



