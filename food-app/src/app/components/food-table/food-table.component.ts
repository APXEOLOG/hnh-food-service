import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FoodInfo } from '../../core/models/food-info';
import { FilterFunction, QueryService } from '../../core/services/query.service';
import { SearchHelpComponent } from '../search-help/search-help.component';

@Component({
  selector: 'food-table',
  templateUrl: './food-table.component.html',
  styleUrls: [ './food-table.component.css' ],
})
export class FoodTableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input()
  public foodData: FoodInfo[];

  public foodDataSource: MatTableDataSource<FoodInfo> = new MatTableDataSource<FoodInfo>();
  public displayedColumns = ['name', 'fep', 'ingredients', 'totalFEP', 'fepvshunger', 'hunger', 'energy'];

  constructor(private queryService: QueryService, private matDialog: MatDialog) { }

  ngOnInit(): void {
    this.foodDataSource.data = this.foodData;
  }

  private filterPredicate: FilterFunction;

  /**
   * Set the paginator and sort after the view init since this component will
   * be able to query its view for the initialized paginator and sort.
   */
  ngAfterViewInit(): void {
    this.foodDataSource.paginator = this.paginator;
    this.foodDataSource.sort = this.sort;
    this.foodDataSource.filterPredicate = (data, filter) => {
      return this.filterPredicate(data);
    };
    this.foodDataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'name': return data.itemName;
        case 'totalFEP': return data.fepBreakdown.totalFEP;
        case 'fepvshunger': return data.fepBreakdown.fepVSHunger;
        default: return data[sortHeaderId];
      }
    };
  }

  applyFilter(filter: string): void {
    // Generate new filter predicate once, it will be applied later to the table
    this.filterPredicate = this.queryService.buildFilterFunction(filter);
    this.foodDataSource.filter = filter;
  }

  showHelp(): void {
    this.matDialog.open(SearchHelpComponent);
  }

  getDataFileLocationUrl(): string {
    return `${window.location}data/food-info.json`;
  }
}
