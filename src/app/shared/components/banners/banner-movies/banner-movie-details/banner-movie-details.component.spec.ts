import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerDetailComponent } from './banner-movie-details.component';

describe('BannerDetailComponent', () => {
  let component: BannerDetailComponent;
  let fixture: ComponentFixture<BannerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
