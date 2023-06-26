import json
import boto3
import base64
import os
from utility.utils import create_response

table_name = os.environ['ALBUM_TABLE_NAME']
dynamodb = boto3.resource('dynamodb')


def create_album(event, context):
  username = event['requestContext']['authorizer']['claims']['cognito:username']
  table = dynamodb.Table(table_name)

  request_body = json.loads(event['body'])
  
  album_name = request_body['album']['albumname']
  all_albums = table.scan(
    FilterExpression='begins_with(#file, :prefix)',
    ExpressionAttributeNames={'#file': 'contentId'},
    ExpressionAttributeValues={':prefix': username}
  )
  print(all_albums)
  for album in all_albums['Items']:
    if album_name in album['contentId']:
      return create_response(400, {"message", "Album name already exists!"})

  shared_users = request_body['album']['sharedusers']
  album = {
    "contentId": username+"-album-"+album_name,
    "images": [],
    "sharedUsers": shared_users
  }
  table.put_item(Item = album)
  return create_response(200, {"message", "Album created succesfully"})

  
