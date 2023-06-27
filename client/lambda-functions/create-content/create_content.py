import json
import boto3
import base64
import os
from utility.utils import create_response
from datetime import datetime



table_name = os.environ['TABLE_NAME']
bucket_name = os.environ['BUCKET_NAME']
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
sns_client = boto3.resource('sns')

def create(event, context):
    print("XDDDD")
    print("XDDDD")
    username = event['requestContext']['authorizer']['claims']['cognito:username']
    email = event['requestContext']['authorizer']['claims']['email']
    sanitized_email = email.replace('@', '-').replace('.', '-')
    print(username)
    print(event['headers'])
    timestamp = str(datetime.timestamp(datetime.now()))
    request_body = json.loads(event['body'])
    print(request_body['file'])
    print(request_body['file']['content'])
    file_content = base64.b64decode(request_body['file']['content']  + "="*((4 - len(request_body['file']['content']) % 4) % 4))
    folder_name ='-album-'+ request_body['foldername']
    file_name = request_body['file']['filename']
    file_size = request_body['file']['size']
    file_type = request_body['file']['type']
    file_last_modified = request_body['file']['lastModified']
    caption = request_body['file']['caption']
    tags = request_body['file']['tags'] 
    print(tags)
    shared = []
    album_table = dynamodb.Table("albums")
    folder = None
    try:
        folder = album_table.get_item(
            Key={
                'contentId': username + folder_name,
            }
        )
    
    except Exception as e:
        return create_response(500, {"message": str(e)})
    
    folder_items = folder.get('Item', {}).get('images', [])

    s3_client.put_object(
        Bucket=bucket_name,
        Key=username+"-time-" +timestamp+"-file-"+file_name,
        Body=file_content
    )
    
    # Table name
    table = dynamodb.Table(table_name)
    
    # Insert file name into table
    response = table.put_item(
        Item={
            'contentId': username+"-time-" + timestamp+"-file-"+file_name,
            'name': file_name,
            'type': file_type,
            'size': file_size,
            'lastModified': file_last_modified,
            'caption': caption,
            'tags': tags,
            'shared': shared
        }
    )
    folder_items.append(username+"-time-" + timestamp+"-file-"+file_name)
    album_table.update_item(
    Key={
        'contentId': username + folder_name,
    },
    UpdateExpression='SET #attr = :val',
    ExpressionAttributeNames={
        '#attr': 'images',
    },
    ExpressionAttributeValues={
        ':val': folder_items,
    }
)
    
    sns_topic_arn = 'arn:aws:sns:eu-central-1:330709951601:user-topic-'+sanitized_email
    print(sns_topic_arn)
    sns_topic = sns_client.Topic(sns_topic_arn)
    sns_topic.publish(
        Message=file_name + " Uploaded Successfuly!"
    )
    
    return create_response(200, {"message": "File uploaded successfully"})
