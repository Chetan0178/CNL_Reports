import { TestBed } from '@angular/core/testing';

import { QueryRelatedCodeService } from './query-related-code.service';

describe('QueryRelatedCodeService', () => {
  let service: QueryRelatedCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryRelatedCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
