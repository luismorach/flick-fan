import { TestBed } from '@angular/core/testing';

import { SlideExpansionService } from './slide-expansion.service';

describe('SlideExpansionService', () => {
  let service: SlideExpansionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlideExpansionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
