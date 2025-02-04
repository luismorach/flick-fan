import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayTrilerComponent } from './play-triler.component';

describe('PlayTrilerComponent', () => {
  let component: PlayTrilerComponent;
  let fixture: ComponentFixture<PlayTrilerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayTrilerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayTrilerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
