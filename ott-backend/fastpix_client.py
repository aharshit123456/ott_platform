import requests
from requests.auth import HTTPBasicAuth

class FastPixClient:
    def __init__(self, access_token, secret_key):
        self.auth = HTTPBasicAuth(access_token, secret_key)
        self.base_url = "https://api.fastpix.io/v1"

    def get_presigned_url(self, payload):
        """
        Get a presigned URL for uploading media.
        """
        url = f"{self.base_url}/on-demand/upload"
        response = requests.post(url, auth=self.auth, json=payload)
        response.raise_for_status()
        return response.json()

    def create_playback_id(self, media_id, payload):
        """
        Create a playback ID for a media asset.
        """
        url = f"{self.base_url}/on-demand/{media_id}/playback-ids"
        response = requests.post(url, auth=self.auth, json=payload)
        response.raise_for_status()
        return response.json()
