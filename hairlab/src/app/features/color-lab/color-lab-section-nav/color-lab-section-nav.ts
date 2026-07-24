import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type ColorLabSection =
  | 'OVERVIEW'
  | 'LIBRARY'
  | 'INVENTORY'
  | 'FORMULAS'
  | 'SMART_FORMULA'
  | 'LINES';

/**
 * Navigazione persistente del Color Lab.
 *
 * Evita che le sei aree principali scompaiano entrando
 * nelle pagine dedicate di Formula Center, Smart Formula
 * e Linee tecniche.
 */
@Component({
  selector: 'app-color-lab-section-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './color-lab-section-nav.html',
  styleUrl: './color-lab-section-nav.css'
})
export class ColorLabSectionNavComponent {
  @Input() activeSection: ColorLabSection = 'OVERVIEW';
}
