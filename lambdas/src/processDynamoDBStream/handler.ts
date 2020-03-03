import { DynamoDBStreamEvent } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { FoodInfoDB, MinifiedFoodInfo } from '../types/model';

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'hnh-food';
const s3 = new AWS.S3();

export async function handler(event: DynamoDBStreamEvent): Promise<void> {
  const toUpdate: FoodInfoDB[] = [];

  event.Records.map(record => {
    if (record.dynamodb && record.dynamodb.NewImage) {
      const item = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
      if (item) {
        toUpdate.push(<FoodInfoDB>item);
      }
    }
  });

  if (toUpdate.length === 0) {
    return;
  }

  let data: { [hashKey: string]: MinifiedFoodInfo } = {};

  try {
    const s3Item = await s3.getObject({
      Bucket: S3_BUCKET_NAME,
      Key: 'data/food-info.json',
    }).promise();

    if (s3Item.Body) {
      data = JSON.parse(s3Item.Body.toString());
    }
  } catch (e) {
  }

  toUpdate.forEach(it => data[it.hashKey] = {
    t: it.itemName,
    r: it.resourceName,
    e: it.energy,
    h: it.hunger,
    i: it.ingredients?.map(ingredient => ({
      n: ingredient.name,
      v: ingredient.percentage,
    })) ?? [],
    f: it.feps?.map(fep => ({
      n: fep.name,
      v: fep.value,
    })) ?? [],
  });

  // Write info file
  await s3.putObject({
    Bucket: S3_BUCKET_NAME,
    Key: 'data/food-info.json',
    Body: JSON.stringify(data),
  }).promise();

  console.log(`Added ${ toUpdate.length } food informations`);
}