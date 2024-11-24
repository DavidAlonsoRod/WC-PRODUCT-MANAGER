
from flask import Flask
from flask_cors import CORS


app = Flask(__name__)


CORS(app, resources={r"/*": {"origins": "*"}})  # Configuración de CORS para toda la aplicación

# ...existing code...

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3001, debug=True)