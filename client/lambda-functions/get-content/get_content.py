import json
import boto3
import os
from utility.utils import create_response

table_name = os.environ['TABLE_NAME']
bucket_name = os.environ['BUCKET_NAME']

def get_all(event, context):
    # Assuming you have the JWT token in the 'Authorization' header
    username = event['requestContext']['authorizer']['claims']['cognito:username']

    # Configure the DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    s3_client = boto3.client('s3')
    table = dynamodb.Table(table_name)

    response = table.scan(
    FilterExpression='begins_with(#file, :prefix)',
    ExpressionAttributeNames={'#file': 'contentId'},
    ExpressionAttributeValues={':prefix': username + '-file'}
)


    # Process the returned data
    items = response['Items']
    print(items)
    responseData = []
    for data in items:
        name = data['contentId']  
        response = s3_client.get_object(Bucket=bucket_name, Key=name)
        images = response['Body'].read() 
        responseData.append({'metadata': data, 'content': images})
      
    
    data = {'response': responseData}
    return create_response(200, data)



