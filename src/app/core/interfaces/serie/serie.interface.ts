import { Images } from "../media/images.interface"
import { Videos } from "../media/videos.interface"
import { Crew } from "../people/credits.interface"
import { Genre } from "../shared/genre.interface"
import { CreatedBy, ProductionCompany, ProductionCountry } from "../shared/production.interface"



export interface SerieList {
    page: number
    results: Serie[]
    total_pages: number
    total_results: number
    type: string
}
export interface Serie {
    adult: boolean
    backdrop_path: string
    created_by: CreatedBy[]
    episode_run_time: number[]
    first_air_date: Date
    genres: Genre[]
    homepage: string
    id: number
    in_production: boolean
    languages: string[]
    last_air_date: Date
    last_episode_to_air: LastEpisodeToAir
    name: string
    next_episode_to_air: string
    number_of_episodes: number
    number_of_seasons: number
    origin_country: string[]
    original_language: string
    original_name: string
    overview: string
    popularity: number
    poster_path: string
    production_companies: ProductionCompany[]
    production_countries: ProductionCountry[]
    seasons: Season[]
    status: string
    tagline: string
    type: string
    vote_average: number
    vote_count: number
    images: Images
    videos: Videos
    external_ids: External_ids | undefined
}


interface LastEpisodeToAir {
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

export interface Season {
    air_date: Date
    id: number
    name: string
    overview: string
    poster_path: string
    season_number: number
    vote_average: number
    episode_count: number
    episodes: Episode[]
}

export interface Episode {
    episode_number: number
    production_code: string
    runtime: number
    show_id: number
    still_path: string
    vote_count: number
    id: number
    name: string
    overview: string
    season_number: number
    vote_average: number
    air_date: string
    crew: Crew
}

export interface External_ids {
    imdb_id: string,
    freebase_mid: string,
    freebase_id: string,
    tvdb_id: number,
    tvrage_id: string,
    wikidata_id: string,
    facebook_id: string,
    instagram_id: string,
    twitter_id: string
}