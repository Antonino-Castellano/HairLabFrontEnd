import {
  DatePipe
} from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  HairDyeInventoryMovement,
  HairDyeInventoryMovementType
} from '../../../models/hair-dye-inventory-movement';

import {
  HairDyeInventoryMovementService
} from '../../../service/hair-dye-inventory-movement-service';

import {
  INVENTORY_UNIT_LABELS
} from '../color-lab-display';

@Component({
  selector:
    'app-hair-dye-inventory-movement-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl:
    './hair-dye-inventory-movement-list.html',
  styleUrl:
    './hair-dye-inventory-movement-list.css'
})
export class HairDyeInventoryMovementListComponent
  implements OnInit {

  private readonly service =
    inject(
      HairDyeInventoryMovementService
    );

  protected readonly movements =
    signal<HairDyeInventoryMovement[]>(
      []
    );

  protected readonly loading =
    signal(false);

  protected readonly errorMessage =
    signal('');

  protected readonly search =
    signal('');

  protected readonly typeFilter =
    signal<
      HairDyeInventoryMovementType |
      'ALL'
    >(
      'ALL'
    );

  protected readonly unitLabels =
    INVENTORY_UNIT_LABELS;

  protected readonly typeLabels:
    Record<HairDyeInventoryMovementType, string> = {

      INITIAL_STOCK:
        'Apertura iniziale',

      STOCK_IN:
        'Carico merce',

      STOCK_OUT:
        'Scarico manuale',

      FORMULA_USAGE:
        'Utilizzo formula',

      RETURN_IN:
        'Reso / reintegro',

      ADJUSTMENT_IN:
        'Rettifica positiva',

      ADJUSTMENT_OUT:
        'Rettifica negativa',

      INVENTORY_COUNT:
        'Inventario fisico',

      ADJUSTMENT:
        'Rettifica legacy'
    };

  protected readonly availableTypes:
    HairDyeInventoryMovementType[] = [
      'INITIAL_STOCK',
      'STOCK_IN',
      'STOCK_OUT',
      'FORMULA_USAGE',
      'RETURN_IN',
      'ADJUSTMENT_IN',
      'ADJUSTMENT_OUT',
      'INVENTORY_COUNT',
      'ADJUSTMENT'
    ];

  protected readonly filteredMovements =
    computed(
      () => {

        const query =
          this.search()
            .trim()
            .toLowerCase();

        return this.movements()
          .filter(
            movement => {

              if (
                this.typeFilter() !==
                  'ALL'
                &&
                movement.movementType !==
                  this.typeFilter()
              ) {

                return false;
              }

              if (
                !query
              ) {

                return true;
              }

              return (
                movement.brand
                + ' '
                + (
                    movement.lineName ??
                    ''
                  )
                + ' '
                + movement.code
                + ' '
                + movement.name
                + ' '
                + (
                    movement.actorEmail ??
                    ''
                  )
                + ' '
                + (
                    movement.referenceCode ??
                    ''
                  )
                + ' '
                + (
                    movement.reason ??
                    ''
                  )
              )
                .toLowerCase()
                .includes(
                  query
                );
            }
          );
      }
    );

  protected readonly totalPositive =
    computed(
      () =>
        this.movements()
          .filter(
            movement =>
              movement.signedDelta >
              0
          )
          .length
    );

  protected readonly totalNegative =
    computed(
      () =>
        this.movements()
          .filter(
            movement =>
              movement.signedDelta <
              0
          )
          .length
    );

  ngOnInit(): void {

    this.load();
  }

  protected load(): void {

    this.loading.set(
      true
    );

    this.errorMessage.set(
      ''
    );

    this.service
      .getAll()
      .subscribe({

        next: movements => {

          this.movements.set(
            movements ??
            []
          );

          this.loading.set(
            false
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {

          this.loading.set(
            false
          );

          this.errorMessage.set(
            error.error?.message ??
            'Impossibile caricare i movimenti di magazzino.'
          );
        }
      });
  }

  protected onSearch(
    event:
      Event
  ): void {

    this.search.set(
      (
        event.target as
          HTMLInputElement
      ).value
    );
  }

  protected onTypeFilter(
    event:
      Event
  ): void {

    this.typeFilter.set(
      (
        event.target as
          HTMLSelectElement
      ).value as
        HairDyeInventoryMovementType |
        'ALL'
    );
  }

  protected getSign(
    movement:
      HairDyeInventoryMovement
  ): string {

    return movement.signedDelta >
      0

      ? '+'
      : '';
  }
}
