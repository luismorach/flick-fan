import { TestBed } from '@angular/core/testing';

import { MediaCapability } from './media-capability';

describe('MediaCapability', () => {
  let service: MediaCapability;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaCapability);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
