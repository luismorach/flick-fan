export function getWideImage(path: string) {
    return (path) ? `http://image.tmdb.org/t/p/original${path}` : 'assets/default-horizontal.png'
}

export function getTallImage(path: string) {
    return (path) ? `http://image.tmdb.org/t/p/original${path}` : 'assets/default.png'
}

export function getSquareImage(path: string) {
    return (path) ? `http://image.tmdb.org/t/p/original${path}` : 'assets/default-cuadrada.png'
}

