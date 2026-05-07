import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'autoImage'
})
export class AutoImagePipe implements PipeTransform {

  transform(path: string | undefined, type: string, size: string = 'original'): string {
    switch (type) {
      case 'backdrop-wide': return this.getWideImage(size, path);
      case 'backdrop-square': return this.getSquareImage(size, path);
      case 'poster': return this.getTallImage(size, path);
      case 'logo': return this.getLogoTitle(path)
      default: return this.getTallImage(size,path);
    }
  }
  getWideImage(size: string, path: string | undefined) {
    return (path?.trim) ? `https://image.tmdb.org/t/p/${size}${path}` : 'assets/default-horizontal.png'
  }

  getTallImage(size: string, path: string | undefined) {
    return (path?.trim()) ? `https://image.tmdb.org/t/p/${size}${path}` : 'assets/default.png'
  }

  getSquareImage(size: string, path: string | undefined) {
    return (path?.trim()) ? `https://image.tmdb.org/t/p/${size}${path}` : 'assets/default-cuadrada.png'
  }

  getLogoTitle(path: string | undefined) {
    return `https://live.metahub.space/logo/medium/${path}/img`
  }


}
