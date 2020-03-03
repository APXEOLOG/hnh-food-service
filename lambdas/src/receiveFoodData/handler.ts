import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';
import { ApiResult, FoodInfo, FoodInfoDB } from '../types/model';

const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'hnh-food';
const CLIENT = new AWS.DynamoDB.DocumentClient();

export async function handler(items: FoodInfo[]): Promise<ApiResult> {
  try {
    if (items.length === 0) {
      return {
        success: true,
      };
    }

    let dbEntities: FoodInfoDB[] = items.map(it => ({
      ...it,
      hashKey: calculateHash(it),
    }));

    // Ensure no duplicates
    const map: { [hashKey: string]: FoodInfoDB } = { };
    dbEntities.forEach(it => map[it.hashKey] = it);
    dbEntities = Object.values(map);

    // Split per 25 entries
    const batches = batchify(dbEntities, 25);

    for (let i = 0; i < batches.length; i++) {
      try {
        const promises: Promise<unknown>[] = batches[i].map(async it => {
          try {
            return await CLIENT.put({
              Item: it,
              TableName: DYNAMODB_TABLE_NAME,
              ConditionExpression: 'attribute_not_exists(hashKey)'
            }).promise();
          } catch (e) {
            // ConditionalCheckFailedException
            return;
          }
        });
        await Promise.all(promises);
      } catch (e) {
        console.error('Cannot insert data into DDB', e);
      }
    }

    return {
      success: true,
    };
  } catch (e) {
    console.error(`Error during saving data`, e);
    return {
      success: false,
    };
  }
}

function calculateHash(foodData): string {
  let hashSource = `${ foodData.itemName };${ foodData.resourceName };`;
  foodData.ingredients.forEach(it => {
    hashSource = `${ hashSource }${ it.name };${ it.percentage };`;
  });
  return crypto.createHash('md5').update(hashSource).digest('hex');
}

function batchify<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];

  while (arr.length > size) {
    result.push(arr.slice(0, size));
    arr = arr.slice(size);
  }
  if (arr.length > 0) {
    result.push(arr);
  }

  return result;
}