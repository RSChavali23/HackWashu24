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

def save_clothes(type, size, color):
    db = get_db_connection()
    clothes_collection = db["clothes"]
    clothes_data = {
        "type": type,
        "size": size,
        "color": color
    }
    clothes_collection.insert_one(clothes_data)
    #success("Clothes saved successfully!")
