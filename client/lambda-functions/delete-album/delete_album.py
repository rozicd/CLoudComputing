import os
import json
import boto3
from utility.utils import create_response


def delete(event, context):
  table_name = os.environ['TABLE_NAME']
  bucket_name = os.environ['BUCKET_NAME']
  album_table_name = os.environ['ALBUM_TABLE_NAME']
  
  s3_client = boto3.client('s3')
  dynamodb = boto3.resource('dynamodb')
  table = dynamodb.Table(table_name)
  album_table = dynamodb.Table(album_table_name)
  
  folder_name =  event['pathParameters']['id']
  username = event['requestContext']['authorizer']['claims']['cognito:username']
  
  folder_id = username + "-album-"+folder_name
  folder = None
  try:
    folder = album_table.get_item(
            Key={
                'contentId': folder_id,
            }
        )
    folder_items = folder.get('Item', {}).get('images', [])
    
    album_table.delete_item(
            Key={
                'contentId': folder_id,
            }
        )
    
    for item in folder_items:
      table.delete_item(
            Key={
                'contentId': item,
            }
        )
      
      s3_client.delete_object(
            Bucket=bucket_name,
            Key=item
        )
  except Exception as e:
      return create_response(500, {"message": str(e)})

