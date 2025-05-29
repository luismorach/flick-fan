import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayTrailerEmbeedComponent } from './play-trailer-embeed.component';

describe('PlayTrailerEmbeedComponent', () => {
  let component: PlayTrailerEmbeedComponent;
  let fixture: ComponentFixture<PlayTrailerEmbeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayTrailerEmbeedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayTrailerEmbeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
