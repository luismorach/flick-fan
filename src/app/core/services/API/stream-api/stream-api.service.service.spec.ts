import { TestBed } from '@angular/core/testing';

import { StreamApiServiceService } from './stream-api.service.service';

describe('StreamApiServiceService', () => {
  let service: StreamApiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StreamApiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
