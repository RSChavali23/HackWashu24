import sys
import os
from PIL import Image
import numpy as np

# Ensure we have the right number of arguments
if len(sys.argv) != 3:
    print("Usage: python process.py <LOCAL_IMAGE_PATH> <OUTPUT_PATH>")
    sys.exit(1)

LOCAL_IMAGE_PATH = sys.argv[1]
OUTPUT_PATH = sys.argv[2]

# Extract the base filename without extension
base_filename = os.path.splitext(os.path.basename(LOCAL_IMAGE_PATH))[0]

# Define mask image path based on the local image path
mask_filename = f"{base_filename}_mask.png"
mask_image_path = os.path.join('/home/ec2-user/server/NotreCoutureServer/computer_vision/FastSAM/output', mask_filename)

# Check if the mask exists
if not os.path.isfile(mask_image_path):
    print(f"Mask file does not exist: {mask_image_path}")
    sys.exit(1)

original_image = Image.open(LOCAL_IMAGE_PATH).convert('RGB')
mask_image = Image.open(mask_image_path).convert('L')  # Convert mask to grayscale

# Convert images to numpy arrays
original_array = np.array(original_image)
mask_array = np.array(mask_image)

# Ensure that the mask size matches the original image
if original_array.shape[:2] != mask_array.shape:
    print(f"Mask size {mask_array.shape} does not match image size {original_array.shape[:2]}")
    sys.exit(1)

# Create an output array where we will place the masked image
output_array = np.zeros((original_array.shape[0], original_array.shape[1], 4), dtype=np.uint8)

# Use the mask to extract the corresponding parts of the original image
output_array[:, :, :3] = original_array  # Copy RGB channels
output_array[:, :, 3] = mask_array  # Use the mask as the alpha channel

# Convert the result back to an image
output_image = Image.fromarray(output_array, 'RGBA')

# Define the final output path based on the provided OUTPUT_PATH
final_output_path = OUTPUT_PATH.replace('.jpg', '.png')

# Ensure the output directory exists
output_dir = os.path.dirname(final_output_path)
os.makedirs(output_dir, exist_ok=True)

# Save the result as PNG to preserve the alpha channel
output_image.save(final_output_path)

# Optionally, print confirmation
print(f"Masked image saved at: {final_output_path}")

