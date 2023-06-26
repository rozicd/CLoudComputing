import json
import boto3
import os
from utility.utils import create_response

table_name = os.environ['TABLE_NAME']
bucket_name = os.environ['BUCKET_NAME']
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def get_shared(event, context):
    username = event['requestContext']['authorizer']['claims']['cognito:username']
    table = dynamodb.Table(table_name)
    albums_table = dynamodb.Table("albums")
    response = table.scan()

    items = response['Items']
    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        items.extend(response['Items'])

    response_albums = albums_table.scan()

    albums = response_albums['Items']
    while 'LastEvaluatedKey' in response:
        response_albums = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        albums.extend(response['Items'])

    shared_albums = []
    shared_items = []

    for item in items:
        shared_usernames = item.get('shared', [])
        if username in shared_usernames:
            name = item['contentId']  
            response = s3_client.get_object(Bucket=bucket_name, Key=name)
            images = response['Body'].read() 
            shared_items.append({'metadata': item, 'content': images})
            

    for album in albums:
        shared_usernames = album.get('sharedUsers', [])
        if username in shared_usernames:
            shared_albums.append(album['contentId'])
        
    shared_content = {"files": shared_items,"albums":shared_albums}
    
    data = {'response': shared_content}
    return create_response(200, data)

