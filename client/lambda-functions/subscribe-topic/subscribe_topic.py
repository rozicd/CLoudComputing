import json
import boto3
from utility.utils import create_response
import uuid

sns_client = boto3.client('sns')
dynamodb = boto3.resource('dynamodb')

def subscribe(event, context):

    email = event['requestContext']['authorizer']['claims']['email']
    username = event['requestContext']['authorizer']['claims']['cognito:username']
    family_table = dynamodb.Table("family")
    unique_token = str(uuid.uuid4())
    response = family_table.put_item(
        Item={
            'username': username,
            'family': [],
            'uniqueInviteToken': unique_token
        }
    )

    sanitized_email = email.replace('@', '-').replace('.', '-')
    print(email)
    topic_name = f'user-topic-{sanitized_email}'
    response = sns_client.create_topic(Name=topic_name)
    topic_arn = response['TopicArn']

    response = sns_client.subscribe(
    TopicArn=topic_arn,
    Protocol='email',
    Endpoint=email
    )

    return create_response(200,{"message","ok"})

