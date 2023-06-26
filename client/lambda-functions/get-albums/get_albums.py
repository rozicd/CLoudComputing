import json
import boto3
import os
from utility.utils import create_response

table_name = os.environ['ALBUM_TABLE_NAME']

def get_all(event, context):
    username = event['requestContext']['authorizer']['claims']['cognito:username']
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)
    
    response = table.scan(
    FilterExpression='begins_with(#file, :prefix)',
    ExpressionAttributeNames={'#file': 'contentId'},
    ExpressionAttributeValues={':prefix': username}
    )
    
    print(response['Items'])
    return create_response(200, response)