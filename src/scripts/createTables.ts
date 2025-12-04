import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { client, tableName } from '../config/db';
// import { getUserTableParams } from './generateUserTableParams';

// async function createTables() {
//   try {
//     const params = getUserTableParams();
//     await client.createTable(params).promise();
//     console.log('DynamoDB table created successfully.');
//   } catch (error: any) {
//     if (error.code === 'ResourceInUseException') {
//       console.log('Table already exists.');
//     } else {
//       console.error('Error creating DynamoDB table:', error);
//       if (typeof process !== 'undefined') process.exit(1);
//     }
//   }
// }

async function createTable() {
  const command = new CreateTableCommand({
    TableName: tableName,
    AttributeDefinitions: [
      { AttributeName: 'pk', AttributeType: 'S' },
      { AttributeName: 'sk', AttributeType: 'S' },
      { AttributeName: 'gsi1pk', AttributeType: 'S' },
      { AttributeName: 'gsi1sk', AttributeType: 'S' },

      // 👇 Future GSI attributes
      { AttributeName: 'gsi2pk', AttributeType: 'S' },
      { AttributeName: 'gsi2sk', AttributeType: 'S' },
      { AttributeName: 'gsi3pk', AttributeType: 'S' },
      { AttributeName: 'gsi3sk', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'pk', KeyType: 'HASH' },
      { AttributeName: 'sk', KeyType: 'RANGE' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'gsi1',
        KeySchema: [
          { AttributeName: 'gsi1pk', KeyType: 'HASH' },
          { AttributeName: 'gsi1sk', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'gsi2',
        KeySchema: [
          { AttributeName: 'gsi2pk', KeyType: 'HASH' },
          { AttributeName: 'gsi2sk', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'gsi3',
        KeySchema: [
          { AttributeName: 'gsi3pk', KeyType: 'HASH' },
          { AttributeName: 'gsi3sk', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST' // optional if you're using ProvisionedThroughput
  });

  try {
    const result = await client.send(command);
    console.log('✅ Table created:', result.TableDescription?.TableName);
  } catch (err: any) {
    if (err.name === 'ResourceInUseException') {
      console.log('⚠️ Table already exists.');
    } else {
      console.error('❌ Failed to create table:', err);
    }
  }
}

createTable();
