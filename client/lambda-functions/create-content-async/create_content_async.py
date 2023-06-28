import json
import boto3
from utility.utils import create_response

lambda_client = boto3.client('lambda')
def create_async(event, context):

    

    print("XD")
    lambda_client = boto3.client('lambda')
    lambda_client.invoke(
        FunctionName='arn:aws:lambda:eu-central-1:330709951601:function:api-gateway-demo-dev-createContent',
        InvocationType='Event',
        Payload=json.dumps(event)
    )
    
    # Return an immediate response
    return create_response(200, {"message":"Upload-Started!"})