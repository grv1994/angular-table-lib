import { TestBed } from '@angular/core/testing';

import { AgTableService } from './ag-table.service';

describe('AgTableService', () => {
  let service: AgTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
