import { Component, OnInit } from '@angular/core';
import { FoodInfo } from './core/models/food-info';
import { FoodDataService } from './core/services/food-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
})
export class AppComponent implements OnInit {
  foodData: FoodInfo[] | null = null;

  constructor(private foodDataService: FoodDataService) {
  }

  ngOnInit(): void {
    this.foodDataService.load().subscribe(data => this.foodData = data);
  }
}
