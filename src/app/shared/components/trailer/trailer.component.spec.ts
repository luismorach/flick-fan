import { ComponentFixture, TestBed } from '@angular/core/testing';
import PlayTrailerComponent from './play-trailer.component';



describe('PlayTrilerComponent', () => {
  let component: PlayTrailerComponent;
  let fixture: ComponentFixture<PlayTrailerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayTrailerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayTrailerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
