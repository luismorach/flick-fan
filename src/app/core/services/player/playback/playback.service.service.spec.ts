import { TestBed } from '@angular/core/testing';

import { PlaybackServiceService } from './playback.service.service';

describe('PlaybackServiceService', () => {
  let service: PlaybackServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaybackServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
