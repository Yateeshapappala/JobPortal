import { TestBed } from '@angular/core/testing';

import { ApplicationStorageService } from './application-storage.service';

describe('ApplicationStorageService', () => {
  let service: ApplicationStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
