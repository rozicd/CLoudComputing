import json
import boto3
import os
from utility.utils import create_response
import uuid

def send_email(event, context):
    users = event['pathParameters']['username']
    username = users.split('-')[0]
    refered = users.split('-')[1]
    
    dynamo = boto3.resource('dynamodb')
    table = dynamo.Table("family")
    
    family = table.get_item(
        Key={
                'username': username,
            }
    )
    token = family.get('Item', {}).get('uniqueInviteToken', "")
    cognito_client = boto3.client('cognito-idp')
    try:
        response = cognito_client.admin_get_user(
            UserPoolId='eu-central-1_IvEUKvEb1',
            Username=username
        )
        email = None
        for attribute in response['UserAttributes']:
            if attribute['Name'] == 'email':
                email = attribute['Value']
                break

        if email is None:
            return create_response(404, "Email not found for the user")

        print(email)
        ses_client = boto3.client('ses', region_name='eu-central-1')
        subject = "Hello from Amazon SES"
        body_text = f"Hello {username},\n\nThis is a test email sent from Amazon SES."
        body_html = f"<html><body><h1>Hello {username}</h1><p>This is a test email sent from Amazon SES. https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/confirm-referral/{users}/{token}</p></body></html>"

        response = ses_client.send_email(
            Source='topGoAppRS@gmail.com',
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': subject},
                'Body': {
                    'Text': {'Data': body_text},
                    'Html': {'Data': body_html}
                }
            }
        )

        return create_response(200, "Email sent successfully")

    except cognito_client.exceptions.UserNotFoundException:
        return create_response(404, "User not found")

    except Exception as e:
        return create_response(500, str(e))

def adding_referal(event, context):
    users = event['pathParameters']['username']
    username = users.split('-')[0]
    refered = users.split('-')[1]
    token = event['pathParameters']['token']
    dynamo = boto3.resource('dynamodb')
    table = dynamo.Table("family")
    
    family = table.get_item(
        Key={
                'username': username,
            }
    )
    inv_token = family.get('Item', {}).get('uniqueInviteToken', "")
    if token == inv_token:
        families =  family.get('Item', {}).get('family', [])
        families.append(refered)
        unique_token = str(uuid.uuid4())
        table.update_item(
        Key={
            'username': username,
        },
        UpdateExpression='SET #attr = :val, #tok = :tok',
        ExpressionAttributeNames={
            '#attr': 'family',
            '#tok': 'uniqueInviteToken'
        },
        ExpressionAttributeValues={
            ':val': families,
            ':tok': unique_token
        })
    
    else:
        return create_response(400, {"message":"error :P"})

    return create_response(200, {"message": "referal created"})

def check_if_added(event, context):
    users = event['pathParameters']['username']
    username = users.split('-')[0]
    refered = users.split('-')[1]
    dynamo = boto3.resource('dynamodb')
    table = dynamo.Table("family")
    
    family = table.get_item(
        Key={
                'username': username,
            }
    )
    
    families =  family.get('Item', {}).get('family', [])
    
    if refered in families:
        return create_response(200, {"message": "He is there"})
    
    return create_response(400, {"message": "not there"})

def success_state(event, context):
    print("Mile vozi belu limuzinu")
    
    
def lambda_trigger(event, context):
    stepfunctions_client = boto3.client('stepfunctions')
    users = event['pathParameters']['username']
    input_data = {
    
        'pathParameters': {
            'username': users
        }
    }
    
    response = stepfunctions_client.start_execution(
        stateMachineArn='arn:aws:lambda:eu-central-1:330709951601:function:api-gateway-demo-dev-sendFamilyRequestEmail',
        input=json.dumps(input_data)
    )
    