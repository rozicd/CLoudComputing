import json
import boto3
import os
from utility.utils import create_response

def send_email(event, context):
    username = event['pathParameters']['username']

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
        body_html = f"<html><body><h1>Hello {username}</h1><p>This is a test email sent from Amazon SES.</p></body></html>"

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
