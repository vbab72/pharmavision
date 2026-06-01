
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mysqldb import MySQL
import pandas as pd
import os

# =========================
# FLASK APP
# =========================

app = Flask(__name__)
CORS(app)

# =========================
# MYSQL CONFIGURATION
# =========================

app.config['MYSQL_HOST'] = 'mysql.railway.internal'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'EEWpkFQLEhdbIhZGDDJrDdMHmWbgZxQv'
app.config['MYSQL_DB'] = 'railway'
app.config['MYSQL_PORT'] = 3306


mysql = MySQL(app)

# =========================
# UPLOAD FOLDER
# =========================

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =========================
# HOME ROUTE
# =========================

@app.route('/')
def home():
    return "Pharmacy Backend Running Successfully"

# =========================
# TEST DATABASE CONNECTION
# =========================

@app.route('/test_db')
def test_db():

    try:

        cur = mysql.connection.cursor()
        cur.execute("SELECT 1")
        cur.close()

        return "MySQL Connection Successful"

    except Exception as e:

        return f"Error: {str(e)}"

# =========================
# LOGIN API
# =========================

@app.route('/login', methods=['POST'])
def login():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data received"
            }), 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({
                "success": False,
                "message": "Username and password required"
            }), 400

        cur = mysql.connection.cursor()

        query = """
            SELECT * FROM admins
            WHERE username=%s AND password=%s
        """

        cur.execute(query, (username, password))

        user = cur.fetchone()

        cur.close()

        if user:

            return jsonify({
                "success": True,
                "message": "Login successful"
            })

        else:

            return jsonify({
                "success": False,
                "message": "Invalid Username or Password"
            }), 401

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# =========================
# ADD MEDICINE API
# =========================

@app.route('/add_medicine', methods=['POST'])
def add_medicine():

    try:

        data = request.get_json()

        name = data['name']
        category = data['category']
        quantity = int(data['quantity'])
        price = float(data['price'])
        expiry_date = data['expiry_date']

        cur = mysql.connection.cursor()

        query = """
        INSERT INTO medicines
        (name, category, quantity, price, expiry_date)
        VALUES (%s, %s, %s, %s, %s)
        """

        cur.execute(query, (
            name,
            category,
            quantity,
            price,
            expiry_date
        ))

        mysql.connection.commit()

        cur.close()

        return jsonify({
            "success": True,
            "message": "Medicine added successfully"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# =========================
# GET ALL MEDICINES API
# =========================

@app.route('/get_medicines', methods=['GET'])
def get_medicines():

    try:

        cur = mysql.connection.cursor()

        cur.execute("SELECT * FROM medicines")

        medicines = cur.fetchall()

        medicine_list = []

        for medicine in medicines:

            medicine_data = {
                "id": medicine[0],
                "name": medicine[1],
                "category": medicine[2],
                "quantity": medicine[3],
                "price": medicine[4],
                "expiry_date": str(medicine[5])
            }

            medicine_list.append(medicine_data)

        cur.close()

        return jsonify(medicine_list)

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# =========================
# DELETE MEDICINE API
# =========================

@app.route('/delete_medicine/<int:id>', methods=['DELETE'])
def delete_medicine(id):

    try:

        cur = mysql.connection.cursor()

        query = "DELETE FROM medicines WHERE id=%s"

        cur.execute(query, (id,))

        mysql.connection.commit()

        cur.close()

        return jsonify({
            "success": True,
            "message": "Medicine deleted successfully"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# =========================
# BILLING API
# =========================

@app.route('/create_bill', methods=['POST'])
def create_bill():

    try:

        data = request.get_json()

        medicine_id = int(data['medicine_id'])
        quantity = int(data['quantity'])

        cur = mysql.connection.cursor()

        # GET MEDICINE DETAILS
        cur.execute(
            "SELECT quantity, price FROM medicines WHERE id=%s",
            (medicine_id,)
        )

        medicine = cur.fetchone()

        if not medicine:

            return jsonify({
                "success": False,
                "message": "Medicine not found"
            })

        available_quantity = medicine[0]
        price = medicine[1]

        # CHECK STOCK
        if quantity > available_quantity:

            return jsonify({
                "success": False,
                "message": "Insufficient stock"
            })

        total = quantity * price

        # SAVE SALE
        insert_query = """
        INSERT INTO sales
        (medicine_id, quantity, total)
        VALUES (%s, %s, %s)
        """

        cur.execute(insert_query, (
            medicine_id,
            quantity,
            total
        ))

        # UPDATE STOCK
        update_query = """
        UPDATE medicines
        SET quantity = quantity - %s
        WHERE id = %s
        """

        cur.execute(update_query, (
            quantity,
            medicine_id
        ))

        mysql.connection.commit()

        cur.close()

        return jsonify({
            "success": True,
            "message": "Bill generated successfully",
            "total_amount": total
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# =========================
# EXCEL UPLOAD API
# =========================

# =========================
# FINAL MULTI BILL API
# =========================

@app.route('/final_bill', methods=['POST'])
def final_bill():

    try:

        data = request.get_json()

        items = data['items']

        grand_total = 0

        cur = mysql.connection.cursor()

        for item in items:

            medicine_id = int(item['medicine_id'])
            quantity = int(item['quantity'])

            # GET MEDICINE
            cur.execute(
                """
                SELECT quantity, price
                FROM medicines
                WHERE id=%s
                """,
                (medicine_id,)
            )

            medicine = cur.fetchone()

            if not medicine:

                return jsonify({
                    "success": False,
                    "message": "Medicine not found"
                })

            available_quantity = medicine[0]
            price = float(medicine[1])

            # CHECK STOCK
            if quantity > available_quantity:

                return jsonify({
                    "success": False,
                    "message":
                    "Insufficient stock"
                })

            total = quantity * price

            grand_total += total

            # SAVE SALE
            cur.execute(
                """
                INSERT INTO sales
                (medicine_id, quantity, total)
                VALUES (%s, %s, %s)
                """,
                (
                    medicine_id,
                    quantity,
                    total
                )
            )

            # UPDATE STOCK
            cur.execute(
                """
                UPDATE medicines
                SET quantity =
                quantity - %s
                WHERE id = %s
                """,
                (
                    quantity,
                    medicine_id
                )
            )

        mysql.connection.commit()

        cur.close()

        return jsonify({
            "success": True,
            "message":
            "Final bill generated successfully",
            "grand_total": grand_total
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })


@app.route('/upload_excel', methods=['POST'])
def upload_excel():

    try:

        if 'file' not in request.files:

            return jsonify({
                "success": False,
                "message": "No file uploaded"
            })

        file = request.files['file']

        filepath = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        file.save(filepath)

        # READ EXCEL FILE
        df = pd.read_excel(filepath)

        cur = mysql.connection.cursor()

        for index, row in df.iterrows():

            query = """
            INSERT INTO medicines
            (name, category, quantity, price, expiry_date)
            VALUES (%s, %s, %s, %s, %s)
            """

            cur.execute(query, (
                str(row['Medicine Name']),
                str(row['Category']),
                int(row['Quantity']),
                float(row['Price']),
                str(row['Expiry'])
            ))

        mysql.connection.commit()

        cur.close()

        return jsonify({
            "success": True,
            "message": "Excel Uploaded Successfully"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        })

# =========================
# RUN SERVER
# =========================

if __name__ == '__main__':
    app.run(debug=True)
