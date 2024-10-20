from pymongo import MongoClient


# MongoDB connection setup
def get_db_connection():
    client = MongoClient(
        "mongodb+srv://rahulchavali1:Ec1rg2VHXzPdIFYX@cluster0.xiwbg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        tls=True,
        tlsAllowInvalidCertificates=True
    )
    db = client["Cluster0"]
    return db

def save_clothes(type, size, color, filename):
    db = get_db_connection()  # Ensure this is defined to connect to MongoDB
    clothes_collection = db["clothes"]
    filename = filename.rsplit('.', 1)[0]
    
    clothes_data = {
        "type": type,
        "size": size,
        "color": color,
        "photo_filename": filename  # Save the file name in the MongoDB entry
    }
    
    clothes_collection.insert_one(clothes_data)

    #success("Clothes saved successfully!")


def get_all_clothes():
    db = get_db_connection()  # Ensure this is defined to connect to MongoDB
    clothes_collection = db["clothes"]
    
    clothes = list(clothes_collection.find({}, {"_id": 0}))
    return clothes