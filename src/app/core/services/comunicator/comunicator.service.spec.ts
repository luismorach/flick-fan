import { TestBed } from '@angular/core/testing';

import { ComunicatorService } from './comunicator.service';

describe('ComunicatorService', () => {
  let service: ComunicatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComunicatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
