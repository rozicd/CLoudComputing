import os
import json
import boto3
from utility.utils import create_response

sns_client = boto3.resource('sns')

def delete(event, context):
  table_name = os.environ['TABLE_NAME']
  bucket_name = os.environ['BUCKET_NAME']
  album_table_name = os.environ['ALBUM_TABLE_NAME']
  email = event['requestContext']['authorizer']['claims']['email']
  sanitized_email = email.replace('@', '-').replace('.', '-')
  
  s3_client = boto3.client('s3')
  dynamodb = boto3.resource('dynamodb')
  table = dynamodb.Table(table_name)
  album_table = dynamodb.Table(album_table_name)
  
  folder_name =  event['pathParameters']['id']
  username = event['requestContext']['authorizer']['claims']['cognito:username']
  
  folder_id = username+"-album-"+folder_name
  folder = None
  try:
    folder = album_table.get_item(
            Key={
                'contentId': folder_id,
            }
        )
    print("#######")
    print(folder)
    folder_items = folder.get('Item', {}).get('images', [])
    print(folder_items)

    album_table.delete_item(
            Key={
                'contentId': folder_id,
            }
        )

    if len(folder_items) != 0:
      for item in folder_items:
        print(item)
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
  sns_topic_arn = 'arn:aws:sns:eu-central-1:330709951601:user-topic-'+sanitized_email
  print(sns_topic_arn)
  sns_topic = sns_client.Topic(sns_topic_arn)
  sns_topic.publish(
  Message=folder_name + " Deleted Successfuly!")


  
    

    
  return create_response(200, {"message": "Album deleted successfully"})

