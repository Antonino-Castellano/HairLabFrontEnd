import {
  provideHttpClient
} from '@angular/common/http';

import {
  TestBed
} from '@angular/core/testing';

import {
  CustomerAnalysisService
} from './customer-analysis-service';

describe(
  'CustomerAnalysisService',
  () => {

    let service:
      CustomerAnalysisService;

    beforeEach(() => {

      TestBed.configureTestingModule({

        providers: [
          provideHttpClient()
        ]

      });

      service =
        TestBed.inject(
          CustomerAnalysisService
        );
    });

    it(
      'should be created',
      () => {

        expect(
          service
        ).toBeTruthy();
      }
    );
  }
);