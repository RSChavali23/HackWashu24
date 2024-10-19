import sys
import os
from PIL import Image
import numpy as np
import cv2

# Determine the absolute path to the FastSAM directory
fastsam_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'FastSAM'))

# Add FastSAM to sys.path if it's not already there
if fastsam_path not in sys.path:
    sys.path.insert(0, fastsam_path)

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
mask_image_path = os.path.join('./output', mask_filename)

# Check if the mask exists
if not os.path.isfile(mask_image_path):
    print(f"Mask file does not exist: {mask_image_path}")
    sys.exit(1)

# Open the original image and scale it down to a maximum of 1024px in any dimension
original_image = Image.open(LOCAL_IMAGE_PATH).convert('RGB')
max_dim = 1024
original_image.thumbnail((max_dim, max_dim))  # Scale down the image in-place

# Save the scaled-down version to ensure it's used for further processing
scaled_image_path = os.path.join('./output', f"{base_filename}_scaled.jpg")
original_image.save(scaled_image_path)

# Load the corresponding mask image (assuming it's generated separately)
mask_image = Image.open(mask_image_path).convert('L')  # Convert mask to grayscale

# Convert images to numpy arrays
original_array = np.array(original_image)
mask_array = np.array(mask_image)

# Ensure that the mask size matches the original image
if original_array.shape[:2] != mask_array.shape:
    print(f"Mask size {mask_array.shape} does not match image size {original_array.shape[:2]}")
    sys.exit(1)

# Apply connected components analysis to remove exclaves and incorporate enclaves
# Use OpenCV for connected component analysis
num_labels, labels_im = cv2.connectedComponents(mask_array)

# Calculate the area (number of pixels) of each component
areas = [np.sum(labels_im == i) for i in range(num_labels)]

# Find the largest connected component (ignoring the background, which is label 0)
largest_component = np.argmax(areas[1:]) + 1  # Ignore background

# Create a new mask with only the largest connected component (main region)
new_mask_array = np.where(labels_im == largest_component, 255, 0).astype(np.uint8)

# Use the new mask to extract the corresponding parts of the original image
output_array = np.zeros((original_array.shape[0], original_array.shape[1], 4), dtype=np.uint8)

# Use the new mask as the alpha channel, ensuring the result retains the main region
output_array[:, :, :3] = original_array  # Copy RGB channels
output_array[:, :, 3] = new_mask_array  # Use the processed mask as the alpha channel

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
