import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FepBarComponent } from './components/fep-bar/fep-bar.component';
import { FoodTableComponent } from './components/food-table/food-table.component';
import { SearchHelpComponent } from './components/search-help/search-help.component';
import { FoodDataService } from './core/services/food-data.service';

@NgModule({
  declarations: [ AppComponent, FoodTableComponent, FepBarComponent, SearchHelpComponent ],
  imports: [ BrowserModule, AppRoutingModule, BrowserAnimationsModule, HttpClientModule, MatProgressSpinnerModule, MatTableModule, MatPaginatorModule, OverlayModule, MatFormFieldModule, MatInputModule, MatSortModule, MatDialogModule, MatIconModule ],
  providers: [ FoodDataService ],
  bootstrap: [ AppComponent ],
})
export class AppModule {
}
