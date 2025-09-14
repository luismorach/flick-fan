export interface ProductionCompany {
    id: number,
    logo_path: string,
    name: string,
    origin_country: string
}
export interface ProductionCountry {
    iso_3166_1: string,
    name: string
}

export interface CreatedBy {
    id: number
    credit_id: string
    name: string
    gender: number
    profile_path: string
}
