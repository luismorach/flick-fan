import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComunicatorService {
  backgroundNavSignal: WritableSignal<boolean> = signal(false)

  constructor() { }

  setBackgroundNav(state: boolean) {
    this.backgroundNavSignal.set(state);
  }
  getBackgroundNav():WritableSignal<boolean>{
    return this.backgroundNavSignal
  }
}
