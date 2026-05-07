/* import { Injectable } from '@angular/core';
import { IStorageStrategy,  ICachePair } from 'ngx-cacheable';

@Injectable()
export class LocalStorageStrategy implements IStorageStrategy {

   getAll(cacheKey: string): ICachePair<any>[] {
    const raw = localStorage.getItem(cacheKey);
    return raw ? JSON.parse(raw) : [];
  }

  add( pair: ICachePair<any>, cacheKey: string): void {
    const all = this.getAll(cacheKey);
    all.push(pair);
    localStorage.setItem(cacheKey, JSON.stringify(all));
  }

  updateAtIndex( index: number, entity: ICachePair<any>,cacheKey: string,): void {
    const all = this.getAll(cacheKey);
    all[index] = entity;
    localStorage.setItem(cacheKey, JSON.stringify(all));
  }

 removeAtIndex(index: number,cacheKey: string): void {
    const all = this.getAll(cacheKey);
    all.splice(index, 1);
    localStorage.setItem(cacheKey, JSON.stringify(all));
  }

   removeAll(cacheKey?: string): void {
    if (cacheKey) {
      localStorage.removeItem(cacheKey);
    } else {
      localStorage.clear();
    }
  }
}
 */