import os
import json
import boto3
from utility.utils import create_response

sns_client = boto3.resource('sns')
def delete(event, context):
    table_name = os.environ['TABLE_NAME']
    bucket_name = os.environ['BUCKET_NAME']
    email = event['requestContext']['authorizer']['claims']['email']
    sanitized_email = email.replace('@', '-').replace('.', '-')
    
    s3_client = boto3.client('s3')
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)
    file_name =  event['pathParameters']['id']

    username = event['requestContext']['authorizer']['claims']['cognito:username']
    folder_name = '-album-'+event['queryStringParameters'].get('album')
    album_table = dynamodb.Table("albums")

    

    
    if not file_name.startswith(username):
        return create_response(403, {"message": "Access denied"})


    
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
    folder_items.remove(file_name)
        
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
    })
    print(file_name)
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
    
    sns_topic_arn = 'arn:aws:sns:eu-central-1:330709951601:user-topic-'+sanitized_email
    print(sns_topic_arn)
    sns_topic = sns_client.Topic(sns_topic_arn)
    sns_topic.publish(
        Message=file_name + " Deleted Successfuly!"
    )

    return create_response(200, {"message": "File deleted successfully"})

