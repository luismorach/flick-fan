import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'autoImage'
})
export class AutoImagePipe implements PipeTransform {

  transform(path: string | undefined, type: String ){
    if (!path)return ''
    switch (type) {
      case 'wide': return this.getWideImage(path);
      case 'tall': return this.getTallImage(path);
      case 'square': return this.getSquareImage(path);
      default :return this.getTallImage(path);
    }
  }
  getWideImage(path: string) {
    return (path) ? `http://image.tmdb.org/t/p/original${path}` : 'assets/default-horizontal.png'
  }

  getTallImage(path: string) {
    return (path) ? `http://image.tmdb.org/t/p/original${path}` : 'assets/default.png'
  }

  getSquareImage(path: string) {
    return (path) ? `http://image.tmdb.org/t/p/original${path}` : 'assets/default-cuadrada.png'
  }


}
