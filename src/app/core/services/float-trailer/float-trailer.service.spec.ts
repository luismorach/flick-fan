import { TestBed } from '@angular/core/testing';
import { FloatTrailerService } from './float-trailer.service';


describe('FloatTrailerService', () => {
  let service: FloatTrailerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FloatTrailerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
