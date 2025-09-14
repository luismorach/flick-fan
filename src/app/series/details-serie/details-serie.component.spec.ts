import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsSerieComponent } from './details-serie.component';

describe('DetailsSerieComponent', () => {
  let component: DetailsSerieComponent;
  let fixture: ComponentFixture<DetailsSerieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsSerieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsSerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
