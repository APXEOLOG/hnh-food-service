
export interface FoodInfo {
  hash: string;
  itemName: string;
  resourceName: string;
  energy: number;
  hunger: number;
  ingredients: Ingredient[];
  feps: ExtendedFEP[];
  fepBreakdown: FEPBreakdown;
}

export interface FEP {
  name: string;
  value: number;
}

export interface ExtendedFEP extends FEP {
  type: string; // str, cha, etc
  code: string; // str1, str2 etc
  amount: number; // +1, +2
}

export interface Ingredient {
  name: string;
  percentage: number;
}

// Breakdown like str1:3 str2:1 str:4
export interface FEPBreakdown {
 [code: string]: number;
 totalFEP: number;
 fepVSHunger: number;
}

export interface MinifiedFoodInfo {
  t: string; // title
  r: string; // resource
  e: number; // energy
  h: number; // hunger
  i: { // ingredients
    n: string; // name
    v: number; // value
  }[];
  f: { // feps
    n: string; // name
    v: number; // value
  }[];
}
