import json
import boto3
import base64
import os
from datetime import datetime
from botocore.exceptions import ClientError
from utility.utils import create_response

table_name = os.environ['TABLE_NAME']
bucket_name = os.environ['BUCKET_NAME']
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(table_name)  

def update(event, context):
    username = event['requestContext']['authorizer']['claims']['cognito:username']
    request_body = json.loads(event['body'])
    
    file_name = request_body['file']['filename']
    file_last_modified = str(datetime.timestamp(datetime.now())*1000)
    caption = request_body['file']['caption']
    tags = request_body['file']['tags']
    size = request_body['file']['size']
    type = request_body['file']['type']
    shared = request_body['file']['shared']
    album = username+ '-album-'+ request_body['foldername']
    updatedalbum = username+ '-album-'+ request_body['newalbum']
    old_id = request_body['file']['oldId']
    new_id = username+"-time-" + file_last_modified+"-file-"+file_name
    print(tags)
    
    if not old_id.startswith(username):
        return create_response(403, {"message": "Access denied"})
    album_table = dynamodb.Table("albums")

    folder = None
    try:
        folder = album_table.get_item(
            Key={
                'contentId':  album,
            }
        )
    except Exception as e:
        return create_response(500, {"message": str(e)})
    
    if 'Item' not in folder:
        print("JA SAM U 44")
        return create_response(404, {"message": "Album was not found!"})
    
    if username in shared:
        return create_response(404, {"message": "You cannot share with yourself!"})

    try:
        response = table.get_item(Key={'contentId': old_id})
    except ClientError as e:
        return create_response(500, {"message": "An error occurred while accessing the file in DynamoDB"})
    
    if 'Item' not in response:
        print("JA SAM U 54")
        return create_response(404, {"message": "File not found"})
    
    try:
        table.delete_item(Key={'contentId': old_id})
    except ClientError as e:
        return create_response(500, {"message": "An error occurred while deleting the old item in DynamoDB"})
    
    try:
        table.put_item(
            Item={
                'contentId': new_id,
                'lastModified': file_last_modified,
                'caption': caption,
                'tags': tags,
                'size' : size,
                'type' : type,
                'shared': shared,
                'name': file_name
            }
        )
    except ClientError as e:
        return create_response(500, {"message": "An error occurred while adding the new item in DynamoDB"})
    
    if updatedalbum != album:
        folder_items = folder.get('Item', {}).get('images', [])
        
        if old_id in folder_items:
            index = folder_items.index(old_id)
            folder_items.remove(folder_items[index])   
            
        album_table.update_item(
        Key={
            'contentId': album,
        },
        UpdateExpression='SET #attr = :val',
        ExpressionAttributeNames={
            '#attr': 'images',
        },
        ExpressionAttributeValues={
            ':val': folder_items,
        })
        updatedfolder = None
        try:
            updatedfolder = album_table.get_item(
                Key={
                    'contentId':  updatedalbum,
                }
            )
            updated_folder_items = updatedfolder.get('Item', {}).get('images', [])
            updated_folder_items.append(new_id)

        except Exception as e:
            return create_response(500, {"message": str(e)})
        album_table.update_item(
        Key={
            'contentId': updatedalbum,
        },
        UpdateExpression='SET #attr = :val',
        ExpressionAttributeNames={
            '#attr': 'images',
        },
        ExpressionAttributeValues={
            ':val': updated_folder_items,
        })
    else:
        folder_items = folder.get('Item', {}).get('images', [])
        
        if old_id in folder_items:
            index = folder_items.index(old_id)
            folder_items[index] = new_id    
            
        album_table.update_item(
        Key={
            'contentId': album,
        },
        UpdateExpression='SET #attr = :val',
        ExpressionAttributeNames={
            '#attr': 'images',
        },
        ExpressionAttributeValues={
            ':val': folder_items,
        })

    
    try:
        s3_client.copy_object(
            Bucket=bucket_name,
            CopySource={'Bucket': bucket_name, 'Key': old_id},
            Key=new_id
        )
    except ClientError as e:
        return create_response(500, {"message": "An error occurred while updating the object in S3"})
    
    try:
        s3_client.delete_object(
            Bucket=bucket_name,
            Key=old_id
        )
    except ClientError as e:
        return create_response(500, {"message": "An error occurred while deleting the object with the old ID in S3"})
    
    return create_response(200, {"message": "File information updated successfully"})