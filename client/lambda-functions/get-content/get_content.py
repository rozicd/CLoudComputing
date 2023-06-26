import json
import boto3
import os
from utility.utils import create_response

table_name = os.environ['TABLE_NAME']
bucket_name = os.environ['BUCKET_NAME']

def get_all(event, context):
    # Assuming you have the JWT token in the 'Authorization' header
    username = event['requestContext']['authorizer']['claims']['cognito:username']
    folder_name_base = event['queryStringParameters'].get('album')
    folder_name = ""
    if folder_name_base.startswith("Shared-"):
        folder_name = folder_name_base.split("Shared-")[1]
    else :
        folder_name = username + '-album-'+event['queryStringParameters'].get('album')

    # Configure the DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    s3_client = boto3.client('s3')
    table = dynamodb.Table(table_name)
    album_table = dynamodb.Table("albums")

    folder = None
    try:
        folder = album_table.get_item(
            Key={
                'contentId':  folder_name,
            }
        )



    
    except Exception as e:
        return create_response(500, {"message": str(e)})
    
    if folder_name_base.startswith("Shared-"):
        shared_usernames = folder.get('sharedUsers', [])
        if username not in shared_usernames:
            create_response(401, {"message","Jos jednom to da si probao"})
    folder_items = folder.get('Item', {}).get('images', [])
    filesFromFolder = []
    for item in folder_items:
        xd = table.get_item(
            Key={
                'contentId': item,
            })
        filesFromFolder.append(xd.get('Item',{}))
        



    print(filesFromFolder)
    # Process the returned data
    responseData = []
    for data in filesFromFolder:
        print(data)
        name = data['contentId']  
        response = s3_client.get_object(Bucket=bucket_name, Key=name)
        images = response['Body'].read() 
        responseData.append({'metadata': data, 'content': images})
      
    
    data = {'response': responseData}
    return create_response(200, data)



