import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'autoImage'
})
export class AutoImagePipe implements PipeTransform {

  transform(path: string | undefined, type: String) {
    switch (type) {
      case 'backdrop-wide': return this.getWideImage(path);
      case 'backdrop-square': return this.getSquareImage(path);
      case 'poster': return this.getTallImage(path);
      case 'logo':return this.getLogoTitle(path)
      default: return this.getTallImage(path);
    }
  }
  getWideImage(path: string | undefined) {
    return (path?.trim) ? `http://image.tmdb.org/t/p/original${path}` : 'assets/default-horizontal.png'
  }

  getTallImage(path: string | undefined) {
    return (path?.trim()) ? `http://image.tmdb.org/t/p/original${path}` : 'assets/default.png'
  }

  getSquareImage(path: string | undefined) {
    return (path?.trim()) ? `http://image.tmdb.org/t/p/original${path}` : 'assets/default-cuadrada.png'
  }

  getLogoTitle(path: string | undefined) {
    return `https://live.metahub.space/logo/medium/${path}/img`
  }


}
