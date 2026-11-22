export interface Torrent{
    streams : Stream []
}

export interface Stream{
    name:string
    title:string
    infoHash:string
}