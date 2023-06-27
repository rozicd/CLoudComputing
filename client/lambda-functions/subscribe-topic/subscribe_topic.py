import json
import boto3
from utility.utils import create_response

sns_client = boto3.client('sns')

def subscribe(event, context):
    

    email = event['requestContext']['authorizer']['claims']['email']
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

