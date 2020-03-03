
export interface FoodInfo {
    itemName: string;
    resourceName: string;
    energy: number;
    hunger: number;
    ingredients: {
        name: string;
        percentage: number;
    }[];
    feps: {
        name: string;
        value: number;
    }[];
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

export interface FoodInfoDB extends FoodInfo {
    hashKey: string;
}

export interface ApiResult {
    success: boolean;
}