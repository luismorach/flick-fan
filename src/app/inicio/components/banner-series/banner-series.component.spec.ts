import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerSeriesComponent } from './banner-series.component';

describe('BannerSeriesComponent', () => {
  let component: BannerSeriesComponent;
  let fixture: ComponentFixture<BannerSeriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerSeriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerSeriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
