import { Images } from "../media/images.interface";
import { Videos } from "../media/videos.interface";
import { Genre } from "./genre.interface";
import { CreatedBy, ProductionCompany, ProductionCountry } from "./production.interface";
import { ListReleaseDates } from "./release-dates.interface";

export interface MediaList<T extends MediaItem> {
    results: T[];
    page: number;
    total_pages: number;
    total_results: number
    type: string
}

export interface MediaItem {
    adult: boolean
    backdrop_path: string
    genre_ids: number[]
    genres: Genre[]
    id: number
    homepage: string
    original_language: string
    overview: string
    popularity: number
    poster_path: string
    production_companies: ProductionCompany[]
    production_countries: ProductionCountry[]
    status: string
    tagline: string
    vote_average: number
    vote_count: number
    images: Images
    videos: Videos
    release_dates: ListReleaseDates
}


export interface PaginatedMetaData {
    page: number;
    total_pages: number;
    total_results: number
    type: string
}