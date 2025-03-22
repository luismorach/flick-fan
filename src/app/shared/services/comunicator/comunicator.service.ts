import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComunicatorService {
  backgroundNavSignal: WritableSignal<boolean> = signal(false)

  constructor() { }

  setBackgroundNav(state: boolean) {
    console.log('establecienod fondo')
    this.backgroundNavSignal.set(state);
  }
  getBackgroundNav():WritableSignal<boolean>{
    console.log('retornando faondo')
    return this.backgroundNavSignal
  }
}
