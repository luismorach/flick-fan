import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideSkeletonComponent } from './card-movie-skeleton.component';

describe('SlideSkeletonComponent', () => {
  let component: SlideSkeletonComponent;
  let fixture: ComponentFixture<SlideSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlideSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlideSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
