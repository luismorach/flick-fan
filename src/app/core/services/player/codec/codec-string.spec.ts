import { TestBed } from '@angular/core/testing';

import { CodecString } from './codec-string';

describe('CodecString', () => {
  let service: CodecString;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodecString);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
