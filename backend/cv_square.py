import sys
import os
from PIL import Image

def crop_transparent_margins(image):
    """
    Crops the transparent margins from an image and returns the cropped image.
    """
    # Convert the image to RGBA to ensure it has an alpha channel
    image = image.convert("RGBA")
    
    # Get the bounding box that contains non-transparent pixels
    bbox = image.getbbox()

    if bbox:
        # Crop the image using the bounding box
        cropped_image = image.crop(bbox)
        return cropped_image
    else:
        return image  # If no bbox is found (image is fully transparent), return original image

def process_image(image_path):
    """
    Processes a single image: crops transparent margins and saves the squared image.
    """
    if not os.path.isfile(image_path):
        print(f"Error: Image file does not exist at path: {image_path}")
        sys.exit(1)
    
    # Open the image
    with Image.open(image_path) as img:
        # Crop the transparent margins
        cropped_img = crop_transparent_margins(img)
        
        
        directory, filename = os.path.split(image_path)

        new_file_path = os.path.join(directory, filename)
        
        # Save the cropped image
        cropped_img.save(new_file_path)
        print(f"Processed and saved: {filename}")

def main():
    # Ensure the script is called with exactly one argument
    if len(sys.argv) != 2:
        print("Usage: python cv_square.py <IMAGE_PATH>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    process_image(image_path)

if __name__ == "__main__":
    main()