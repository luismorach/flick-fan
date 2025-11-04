import { Images } from "../media/images.interface"
import { Videos } from "../media/videos.interface"
import { Genre } from "../shared/genre.interface"
import { ProductionCompany, ProductionCountry } from "../shared/production.interface"

export interface MovieList {
    page: number
    results: Movie[]
    total_pages: number
    total_results: number
    type: string
}

export interface Movie {
    adult: boolean
    backdrop_path: string
    genres: Genre[]
    id: number
    imdb_id:string
    original_language: string
    original_title: string
    overview: string
    popularity: number
    poster_path: string
    release_date: Date
    title: string
    videos: Videos
    images:Images
    vote_average: number
    vote_count: number
    runtime: number
    status: string
    budget: number
    revenue: number
    homepage: string
    production_companies: ProductionCompany[]
    production_countries: ProductionCountry[]
}
