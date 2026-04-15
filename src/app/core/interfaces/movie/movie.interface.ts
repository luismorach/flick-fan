import { Images } from "../media/images.interface"
import { Videos } from "../media/videos.interface"
import { MediaItem, PaginatedMetaData } from "../shared/generic.interface"
import { Genre } from "../shared/genre.interface"
import { ProductionCompany, ProductionCountry } from "../shared/production.interface"
import { ListReleaseDates } from "../shared/release-dates.interface"

export interface MovieList extends PaginatedMetaData {
    results: Movie[]
}

export interface Movie extends MediaItem{
    adult: boolean
    backdrop_path: string
    genre_ids: number[]
    genres: Genre[]
    id: number
    imdb_id: string
    original_language: string
    original_title: string
    overview: string
    popularity: number
    poster_path: string
    release_date: Date
    title: string
    tagline: string
    videos: Videos
    images: Images
    vote_average: number
    vote_count: number
    runtime: number
    status: string
    budget: number
    revenue: number
    homepage: string
    production_companies: ProductionCompany[]
    production_countries: ProductionCountry[]
    release_dates: ListReleaseDates
}
