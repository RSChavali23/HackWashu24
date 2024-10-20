import requests
import time
from config import Config
import xml.etree.ElementTree as ET

# Global variable to store token and timestamp
token_info = {
    "token": None,
    "timestamp": None
}

def generate_link(token):
    # Define the Finicity connect endpoint to generate the link
    url = "https://api.finicity.com/connect/v2/generate"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Finicity-App-Token": token,  # Use the generated token
        "Finicity-App-Key": Config.APP_KEY  # Replace with your app key from the config
    }

    # Prepare the payload with Partner ID and Customer ID
    payload = {
        "partnerId": Config.PARTNER_ID,  # Replace with your partnerId
        "customerId": "7033710983"  # Use the specific customer ID
    }

    # Log the request details for debugging
    print(f"Sending POST request to: {url}")
    print(f"Headers: {headers}")
    print(f"Payload: {payload}")

    # Send the POST request
    response = requests.post(url, json=payload, headers=headers)

    # Log the response details for debugging
    print(f"Link Generation Status Code: {response.status_code}")
    print(f"Response Text: {response.text}")

    # If request is successful, return the generated link
    if response.status_code == 200:
        link = response.json().get("link", None)  # Extract the link from response JSON
        print(f"Generated Link: {link}")  # Log the generated link
        return link
    else:
        raise Exception(f"Failed to generate link: {response.status_code} - {response.text}")

def get_finicity_token():
    # Define the Finicity authentication endpoint
    url = "https://api.finicity.com/aggregation/v2/partners/authentication"
    headers = {
        "Content-Type": "application/json",
        "Finicity-App-Key": Config.APP_KEY  # Include Finicity-App-Key here
    }

    # Prepare the payload with Partner ID and Secret
    payload = {
        "partnerId": Config.PARTNER_ID,
        "partnerSecret": Config.APP_SECRET
    }

    # Send the POST request
    response = requests.post(url, json=payload, headers=headers)

    # Log the raw response content to inspect it
    print(f"Status Code: {response.status_code}")
    print(f"Response Text: {response.text}")

    # Ensure that the response contains valid JSON before attempting to parse
    if response.status_code == 200:
        try:
            # Parse the XML response
            root = ET.fromstring(response.text)
            token = root.find("token").text  # Extract the token from the XML
            print(f"Generated Token: {token}")  # Log the generated token
            token_info["token"] = token
            token_info["timestamp"] = time.time()  # Store the current time

            # Now that we have the token, generate the new link for the user
            new_link = generate_link(token)
            return new_link  # Return the generated link

        except ET.ParseError:
            raise Exception("Error parsing XML from Finicity API")
    else:
        raise Exception(f"Failed to get Finicity token: {response.status_code} - {response.text}")

# Function to check if the token is still valid (less than 90 minutes old) and get the new link
def get_valid_link():
    current_time = time.time()

    # Log the current token status
    if token_info["token"] is None:
        print("No token available, fetching new token.")
    else:
        token_age = (current_time - token_info["timestamp"]) / 60
        print(f"Token age: {token_age:.2f} minutes")

    # If no token exists or it's older than 90 minutes, request a new one and generate a new link
    if token_info["token"] is None or (current_time - token_info["timestamp"]) > 90 * 60:
        print("Token is either missing or expired. Generating a new token and link.")
        return get_finicity_token()
    else:
        # Token is still valid, use the existing token to generate the link
        print("Token is still valid. Generating link using existing token.")
        return generate_link(token_info["token"])
