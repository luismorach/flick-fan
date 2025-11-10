import { animate, state, style, transition, trigger } from "@angular/animations";

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
    ]),
    transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('400ms ease-out', style({ opacity: 0, transform: 'translateY(-20px)' }))
    ])
])

export const fadeIn = trigger('fadeIn', [
    state('void', style({ opacity: 0 })),
    state('in', style({ opacity: 1})),
    transition('void => in', animate('500ms 2s ease-in')),
])
  
export const fadeInButton = trigger('fadeInButton', [
     transition(':enter', [
        style({ opacity: 0}),
        animate('0.5s 2s ease-in', style({ opacity: 1 }))
    ]),
])
  