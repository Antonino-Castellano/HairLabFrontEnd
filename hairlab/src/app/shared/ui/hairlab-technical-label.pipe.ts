import { Pipe, PipeTransform } from '@angular/core';
import {
  hairLabCatalogName,
  hairLabTechnicalLabel,
  hairLabTechnicalText,
} from './hairlab-technical-labels';

/** Traduce esclusivamente la rappresentazione grafica dei valori tecnici HairLab. */
@Pipe({
  name: 'hairLabLabel',
  standalone: true,
  pure: true,
})
export class HairLabTechnicalLabelPipe implements PipeTransform {
  transform(value: unknown, mode: 'value' | 'text' | 'name' = 'value'): string {
    if (mode === 'name') return hairLabCatalogName(value);
    if (mode === 'text') return hairLabTechnicalText(value);
    return hairLabTechnicalLabel(value);
  }
}
