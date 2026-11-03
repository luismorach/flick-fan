import { TestBed } from '@angular/core/testing';

import { FloatCardService } from './float-card.service';

describe('FloatCardService', () => {
  let service: FloatCardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FloatCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
