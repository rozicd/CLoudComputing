import json
import boto3
import base64
import os
from botocore.exceptions import ClientError
from utility.utils import create_response

table_name = os.environ['TABLE_NAME']
bucket_name = os.environ['BUCKET_NAME']
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(table_name)  # Add this line to create a DynamoDB table resource

def update(event, context):
    username = event['requestContext']['authorizer']['claims']['cognito:username']
    request_body = json.loads(event['body'])
    
    file_name = request_body['file']['filename']
    file_size = request_body['file']['size']
    file_type = request_body['file']['type']
    file_last_modified = request_body['file']['lastModified']
    caption = request_body['file']['caption']
    tags = request_body['file']['tags']
    print(tags)
    
    # Check if the user has access to edit the file metadata
    content_id = username + "-file-"
    if not file_name.startswith(content_id):
        return create_response(403, {"message": "Access denied"})
    
    try:
        # Check if the file exists in DynamoDB
        response = table.get_item(Key={'contentId': file_name})
    except ClientError as e:
        return create_response(500, {"message": "An error occurred while accessing the file in DynamoDB"})
    
    if 'Item' not in response:
        return create_response(404, {"message": "File not found"})
    
    # Update file information in the table
    response = table.update_item(
        Key={'contentId': file_name},
        UpdateExpression='SET #typ = :typ, #sze = :sze, #lmod = :lmod, #cap = :cap, #tg = :tg',
        ExpressionAttributeNames={
            '#typ': 'type',
            '#sze': 'size',
            '#lmod': 'lastModified',
            '#cap': 'caption',
            '#tg': 'tags'
        },
        ExpressionAttributeValues={
            ':typ': file_type,
            ':sze': file_size,
            ':lmod': file_last_modified,
            ':cap': caption,
            ':tg': tags
        }
    )
    
    return create_response(200, {"message": "File information updated successfully"})