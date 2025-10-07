import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieSwiperComponent } from './movie-swiper.component';

describe('MovieSwiperComponent', () => {
  let component: MovieSwiperComponent;
  let fixture: ComponentFixture<MovieSwiperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieSwiperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieSwiperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
