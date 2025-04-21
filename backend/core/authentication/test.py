import hmac
import hashlib

# Secret key
secret_key = "your-very-secure-secret-key"

# Data to be hashed
data = "Hello, world!"

# Create the HMAC object
hmac_object = hmac.new(secret_key.encode('utf-8'), data.encode('utf-8'), hashlib.sha256)

# Get the HMAC value
hmac_hex = hmac_object.hexdigest()

print("HMAC-SHA256:", hmac_hex)