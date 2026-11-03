import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselMediaComponent } from './carousel-media.component';

describe('CarouselMediaComponent', () => {
  let component: CarouselMediaComponent;
  let fixture: ComponentFixture<CarouselMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselMediaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarouselMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
