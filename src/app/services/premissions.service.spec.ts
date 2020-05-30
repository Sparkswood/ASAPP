import { TestBed } from '@angular/core/testing';

import { PremissionsService } from './premissions.service';

describe('PremissionsService', () => {
  let service: PremissionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PremissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
