import { Component, Input, OnInit } from '@angular/core';
import { ExtendedFEP } from '../../core/models/food-info';

@Component({
  selector: 'fep-bar',
  templateUrl: './fep-bar.component.html',
  styleUrls: [ './fep-bar.component.css' ],
})
export class FepBarComponent implements OnInit {
  @Input()
  public feps: ExtendedFEP[];

  ngOnInit(): void {

  }

  calculateClass(fep: ExtendedFEP): string {
    return `${fep.type}${fep.amount}`;
  }
}
