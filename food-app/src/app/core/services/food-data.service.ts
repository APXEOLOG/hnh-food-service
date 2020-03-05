import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FepMapping } from '../models/fep';
import { ExtendedFEP, FEP, FEPBreakdown, FoodInfo, MinifiedFoodInfo } from '../models/food-info';

const FOOD_DATA_URL = 'https://food.havenandhearth.link/data/food-info.json';

declare type DataFileFormat = { [hash: string]: MinifiedFoodInfo };

@Injectable()
export class FoodDataService {
  constructor(private http: HttpClient) {
  }

  public load(): Observable<FoodInfo[]> {
    return this.http.get<DataFileFormat>(FOOD_DATA_URL)
      .pipe(map(data => Object.keys(data).map(it => FoodDataService.convertToProperFormat(it, data[it]))));
  }

  private static convertToProperFormat(hash: string, item: MinifiedFoodInfo): FoodInfo {
    return {
      hash,
      itemName: item.t,
      resourceName: item.r,
      hunger: item.h,
      energy: item.e,
      feps: FoodDataService.convertFEPs(item.f?.map(it => ({
        name: it.n,
        value: it.v,
      })) ?? []),
      ingredients: item.i?.map(it => ({
        name: it.n,
        percentage: it.v,
      })) ?? [],
      fepBreakdown: FoodDataService.getFEPBreakdown(item.f?.map(it => ({
        name: it.n,
        value: it.v,
      })) ?? [], item.h),
    };
  }

  private static getFEPBreakdown(feps: FEP[], hunger: number): FEPBreakdown {
    const result: FEPBreakdown = { totalFEP: 0, fepVSHunger: 0 };
    feps.forEach(fep => {
      // Like: Strength +2
      const parts = fep.name.split(' ');
      const code = FepMapping[parts[0]]; // str
      const amount = parseInt(parts[1], 10); // 2
      result[code] = (result[code] ?? 0) + fep.value; // Increase general fep group
      result[`${code}${amount}`] = fep.value;
      result.totalFEP += fep.value;
    });
    result.fepVSHunger = result.totalFEP / hunger;
    return result;
  }

  private static convertFEPs(feps: FEP[]): ExtendedFEP[] {
    return feps.map(fep => {
      // Like: Strength +2
      const parts = fep.name.split(' ');
      return {
        ...fep,
        type: FepMapping[parts[0]],
        amount: parseInt(parts[1], 10),
        code: `${FepMapping[parts[0]]}${parseInt(parts[1], 10)}`
      };
    });
  }
}

