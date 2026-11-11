import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMoviePreviewComponent } from './card-movie-preview.component';

describe('CardMoviePreviewComponent', () => {
  let component: CardMoviePreviewComponent;
  let fixture: ComponentFixture<CardMoviePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardMoviePreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardMoviePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
