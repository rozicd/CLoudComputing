import os
import json
import boto3
from utility.utils import create_response

def delete(event, context):
    table_name = os.environ['TABLE_NAME']
    bucket_name = os.environ['BUCKET_NAME']
    
    s3_client = boto3.client('s3')
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)

    username = event['requestContext']['authorizer']['claims']['cognito:username']
    request_body = json.loads(event['body'])
    
    file_name = request_body['file']['filename']
    content_id = username + "-file-"
    
    if not file_name.startswith(content_id):
        return create_response(403, {"message": "Access denied"})

    try:
        table.delete_item(
            Key={
                'contentId': file_name,
            }
        )
    except Exception as e:
        return create_response(500, {"message": str(e)})

    try:
        s3_client.delete_object(
            Bucket=bucket_name,
            Key=file_name
        )
    except Exception as e:
        return create_response(500, {"message": str(e)})

    return create_response(200, {"message": "File deleted successfully"})

