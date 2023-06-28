import json
import boto3
from utility.utils import create_response

def confirm(event, context):
    sns = boto3.client('sns')
    
    if 'Token' in event['queryStringParameters']:
        token = event['queryStringParameters']['Token']
        topic_arn = 'arn:aws:sns:eu-central-1:330709951601:my-sns-topic'
        
        response = sns.confirm_subscription(
            TopicArn=topic_arn,
            Token=token
        )
        
        return create_response(200,"ok")
    else:
        return create_response(401,"error")