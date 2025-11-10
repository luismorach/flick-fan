import { TestBed } from '@angular/core/testing';

import { CacheStorageStrategyService } from './local-storage-strategy.service';

describe('CacheStorageStrategyService', () => {
  let service: CacheStorageStrategyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheStorageStrategyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
