import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeriesGridComponent } from './series-grid.component';

describe('SeriesGridComponent', () => {
  let component: SeriesGridComponent;
  let fixture: ComponentFixture<SeriesGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriesGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeriesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
