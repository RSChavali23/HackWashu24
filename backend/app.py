from flask import Flask, jsonify, request
from mongodb_handler import save_clothes
import os
import subprocess
from werkzeug.utils import secure_filename
import traceback  # Add this import for detailed error reporting
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

UPLOAD_FOLDER = './uploads'
OUTPUT_FOLDER = './output'
THREED_FOLDER = './3Doutput'

@app.route('/uploadClothes', methods=['POST'])
def upload_clothes():
    try:
        # Ensure there is a photo file in the request
        if 'photo' not in request.files:
            return jsonify({"error": "No photo part in the request"}), 400

        # Get the photo file
        photo = request.files['photo']

        # Validate the required form fields are in the request
        if not all(k in request.form for k in ("type", "size", "color")):
            return jsonify({"error": "Missing required fields"}), 400

        # Extract form fields
        type = request.form["type"]
        size = request.form["size"]
        color = request.form["color"]

        # Validate the photo is selected and is of an allowed file type
        if photo.filename == '':
            return jsonify({"error": "No selected photo"}), 400

        # Ensure the 'uploads' directory exists
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

        # Save the photo to the server
        filename = secure_filename(photo.filename)
        local_image_path = os.path.join(UPLOAD_FOLDER, filename)
        photo.save(local_image_path)

        # Save the clothes data to MongoDB, including the file name
        save_clothes(type, size, color, filename)

        # ---- Run the first script (run_and_process.py) ----
        try:
            run_command = ["python", "./run_and_process.py", local_image_path]
            subprocess.run(run_command, check=True)
            print("run_and_process.py completed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"run_and_process.py failed: {e}")
            return jsonify({"error": f"run_and_process.py failed: {e}"}), 500

        # ---- Run the second script (2D_to_3D.py) on the processed result ----
        processed_image_path = os.path.join(OUTPUT_FOLDER, f"{os.path.splitext(filename)[0]}_final.png")


        if not os.path.exists(processed_image_path):
            return jsonify({"error": "Processed image not found"}), 500

        try:
            output_obj_path = os.path.join(THREED_FOLDER, f"{os.path.splitext(filename)[0]}.obj")
            threeD_command = [
                "python", "./2D_to_3D.py", 
                processed_image_path, 
                output_obj_path
            ]
            subprocess.run(threeD_command, check=True)
            print("2D_to_3D.py completed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"2D_to_3D.py failed: {e}")
            return jsonify({"error": f"2D_to_3D.py failed: {e}"}), 500

        return jsonify({"message": "Clothes uploaded and 3D model generated successfully!", "3D_model": output_obj_path}), 201

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500




@app.route('/api')
def hello_world():
    return jsonify(message="Hello from Flask!")

if __name__ == '__main__':
    app.run(debug=True)

