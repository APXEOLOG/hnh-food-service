
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

export interface FoodInfoDB extends FoodInfo {
    hash: string;
}

export interface ApiResult {
    success: boolean;
}