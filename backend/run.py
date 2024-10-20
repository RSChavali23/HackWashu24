import sys
import os
import numpy as np
from PIL import Image

# Determine the absolute path to the FastSAM directory
fastsam_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../computer_vision/FastSAM'))

# Add FastSAM to sys.path if it's not already there
if fastsam_path not in sys.path:
    sys.path.insert(0, fastsam_path)
from fastsam import FastSAM, FastSAMPrompt



# Ensure we have the right number of arguments
if len(sys.argv) != 3:
    print("Usage: python run.py <LOCAL_IMAGE_PATH> <TEXT_PROMPT>")
    sys.exit(1)

LOCAL_IMAGE_PATH = sys.argv[1]
TEXT_PROMPT = sys.argv[2]

# Check if the image exists
if not os.path.isfile(LOCAL_IMAGE_PATH):
    print(f"Image file does not exist: {LOCAL_IMAGE_PATH}")
    sys.exit(1)

# Extract the base filename without extension
base_filename = os.path.splitext(os.path.basename(LOCAL_IMAGE_PATH))[0]

# Define the output directory and ensure it exists
output_dir = './output'
os.makedirs(output_dir, exist_ok=True)

# Define dynamic mask filename
mask_filename = f"{base_filename}_mask.png"
mask_output_path = os.path.join(output_dir, mask_filename)

# Load the image and scale it down to a max of 1024px in any dimension
image = Image.open(LOCAL_IMAGE_PATH)
max_dim = 1024
image.thumbnail((max_dim, max_dim))  # Scales the image in-place

# Save the scaled image to a temporary path for processing by FastSAM
scaled_image_path = os.path.join(output_dir, f"{base_filename}_scaled.jpg")
image.save(scaled_image_path)

# Load the FastSAM model
model = FastSAM('../computer_vision/FastSAM/weights/FastSAM.pt')
DEVICE = 'cpu'

# Run the FastSAM model on the scaled image
largestDim = max(image.size)
largestDim = largestDim - (largestDim % 32)

everything_results = model(scaled_image_path, device=DEVICE, retina_masks=True, imgsz=largestDim, conf=0.5, iou=0.5)
prompt_process = FastSAMPrompt(scaled_image_path, everything_results, device=DEVICE)

# Process the prompt and generate the mask
ann = prompt_process.text_prompt(text=TEXT_PROMPT)

# Plot the annotations and save the output image
prompt_process.plot(annotations=ann, output_path=os.path.join(output_dir, 'mapping.jpg'))

# Print the shape of the mask for debugging
print(f"Mask shape: {ann.shape}")

# Ensure the mask is a 2D array
if ann.ndim == 3:
    ann = ann[0]

mask = ann.astype(np.uint8) * 255  # Convert boolean mask to binary image

# Print the unique values in the mask for debugging
print(f"Unique values in the mask: {np.unique(mask)}")

# Convert the mask to an image and save it with dynamic filename
mask_image = Image.fromarray(mask)
mask_image.save(mask_output_path)

# Optionally, print the mask output path for verification
print(f"Mask saved at: {mask_output_path}")
