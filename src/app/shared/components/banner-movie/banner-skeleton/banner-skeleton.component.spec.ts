import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerSkeletonComponent } from './banner-skeleton.component';

describe('BannerSkeletonComponent', () => {
  let component: BannerSkeletonComponent;
  let fixture: ComponentFixture<BannerSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
