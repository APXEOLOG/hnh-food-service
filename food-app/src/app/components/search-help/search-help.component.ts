import { Component } from '@angular/core';
import { FepMapping } from '../../core/models/fep';

@Component({
  selector: 'search-help',
  templateUrl: './search-help.component.html',
  styleUrls: [ './search-help.component.css' ],
})
export class SearchHelpComponent {
  public feps = Object.values(FepMapping);
}
