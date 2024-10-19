import sys
import os
import numpy as np
from PIL import Image
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
output_dir = '/home/ec2-user/server/NotreCoutureServer/computer_vision/FastSAM/output'
os.makedirs(output_dir, exist_ok=True)

# Define dynamic mask filename
mask_filename = f"{base_filename}_mask.png"
mask_output_path = os.path.join(output_dir, mask_filename)

model = FastSAM('/home/ec2-user/server/NotreCoutureServer/computer_vision/FastSAM/weights/FastSAM.pt')
DEVICE = 'cpu'
image = Image.open(LOCAL_IMAGE_PATH)
largestDim = max(image.size)
largestDim = largestDim - (largestDim % 32)

everything_results = model(LOCAL_IMAGE_PATH, device=DEVICE, retina_masks=True, imgsz=largestDim, conf=0.1, iou=0.8)
prompt_process = FastSAMPrompt(LOCAL_IMAGE_PATH, everything_results, device=DEVICE)

ann = prompt_process.text_prompt(text=TEXT_PROMPT)

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