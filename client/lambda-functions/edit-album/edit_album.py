import json
import boto3
from utility.utils import create_response
import os

def update(event, context):
    album_table_name = os.environ['ALBUM_TABLE_NAME']
    dynamodb = boto3.resource('dynamodb')
    album_table = dynamodb.Table(album_table_name)
    
    username = event['requestContext']['authorizer']['claims']['cognito:username']
    request_body = json.loads(event['body'])
    
    folder_name = request_body['album']['albumname']
    shared_users = request_body['album']['sharedusers']
    print(shared_users)
    
    if username in shared_users:
        return create_response(400, {"message":"You cannot share album with yourself!!"})
    
    folder_id = username+'-album-'+folder_name
    
    album_table.update_item(
    Key={
        'contentId': folder_id,
    },
    UpdateExpression='SET #attr = :val',
    ExpressionAttributeNames={
        '#attr': 'sharedUsers',
    },
    ExpressionAttributeValues={
        ':val': shared_users,
    })
    
    return create_response(200, {"message":"Album updated succesfully!"})