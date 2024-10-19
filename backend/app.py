from flask import Flask, jsonify, request
from mongodb_handler import save_clothes

app = Flask(__name__)

@app.route('/uploadClothes', methods=['POST'])
def upload_clothes():
    print("hello")
    try:
        # Get data from the POST request
        data = request.get_json()
        print(data)

        # Validate the required fields are in the request
        if not all(k in data for k in ("type", "size", "color")):
            return jsonify({"error": "Missing required fields"}), 400

        # Extract fields
        type = data["type"]
        size = data["size"]
        color = data["color"]

        # Save clothes data to MongoDB
        save_clothes(type, size, color)

        return jsonify({"message": "Clothes uploaded successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api')
def hello_world():
    return jsonify(message="Hello from Flask!")

if __name__ == '__main__':
    app.run(debug=True)

