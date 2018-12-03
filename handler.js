'use strict';
const AWS = require('aws-sdk');
const dynamoDC = new AWS.DynamoDB.DocumentClient({});

module.exports.newOrder = async event => {
  
  const params = ( store_id, order_id, user_id, grand_total ) => {
    return {
      TableName: 'StoreOrders',
      Item: {
        store_id,
        order_id,
        user_id,
        grand_total,
        timestamp : Date.now() // create timestamp here
      }
    };
  };

  try {
    const { store_id, order_id, user_id, grand_total } = event;
    // check the StoreOrders table if the order exists with: store_id + order_id
    const exists = await dynamoDC.get({
      TableName: 'StoreOrders',
      Key: {
        store_id,
        order_id
      }
    }).promise();
    // if the item exists stop!
    if("Item" in exists) {
      throw new Error(`Order ${order_id}, already exists in store ${store_id}`);
    }
    // add the order in the StoreOrders table
    await dynamoDC.put(params(store_id, order_id, user_id, grand_total)).promise();
    return {
      statusCode: 200,
      exists,
      body: {
        message: `Order ${order_id} submitted successfully`,
      },
    
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: 'request failed',
      error : error.message
    };   
  }
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
