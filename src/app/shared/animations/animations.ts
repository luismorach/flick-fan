import { animate, style, transition, trigger } from "@angular/animations";

export const fade = trigger('fade', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 }))
    ]),
    transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 }))
    ])
])

export const emptyState = trigger('emptyState', [
 transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-20px)' }),
      animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
])