import {
  trigger, state, style, transition, animate,
  query, stagger, keyframes
} from '@angular/animations';

export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(12px)' }),
    animate('250ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const slideUp = trigger('slideUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(40px) scale(.96)' }),
    animate('350ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
  ])
]);

export const chartFade = trigger('chartFade', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(.96)' }),
    animate('400ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'scale(1)' }))
  ])
]);

export const listStagger = trigger('listStagger', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(8px)' }),
      stagger('60ms', [
        animate('220ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

export const bubbleIn = trigger('bubbleIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(6px) scale(.96)' }),
    animate('200ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
  ])
]);

export const pulseIn = trigger('pulseIn', [
  transition(':enter', [
    animate('500ms ease-out', keyframes([
      style({ opacity: 0, transform: 'scale(.6)', offset: 0 }),
      style({ opacity: 1, transform: 'scale(1.08)', offset: .6 }),
      style({ opacity: 1, transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);
