import { useEffect, useState } from "react";
import axios from "axios";

 const backgrounds = [
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200",
    "https://images.unsplash.com/photo-1580281657527-47f249e8f4df?w=1200",
    "https://images.unsplash.com/photo-1631549916768-4119b4123a89?w=1200"
  ];

function App() {

  // =========================
  // BACKGROUNDS
  // =========================

 

  const [bg, setBg] = useState(backgrounds[0]);

  // =========================
  // LOGIN STATES
  // =========================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  // =========================
  // PAGE STATES
  // =========================

  const [page, setPage] = useState("dashboard");

  // =========================
  // MEDICINE STATES
  // =========================

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [medicines, setMedicines] = useState([]);

  // =========================
  // SEARCH
  // =========================

  const [search, setSearch] = useState("");

  // =========================
  // EXCEL
  // =========================

  const [excelFile, setExcelFile] = useState(null);

  // =========================
  // BILLING
  // =========================

  const [billMedicineId, setBillMedicineId] = useState("");
  const [billQuantity, setBillQuantity] = useState("");
  const [billItems, setBillItems] = useState([]);

  // =========================
  // RANDOM BACKGROUND
  // =========================

  useEffect(() => {

    const randomIndex = Math.floor(
      Math.random() * backgrounds.length
    );

    setBg(backgrounds[randomIndex]);

  }, []);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async () => {

    try {

      const response = await axios.post(
        "https://pharmavision-api.onrender.com/login",
        {
          username,
          password
        }
      );

      if (response.data.success) {

        setLoggedIn(true);

        fetchMedicines();

      } else {

        alert("Invalid Username or Password");

      }

    } catch (error) {

      console.log(error);

      alert("Server Error");

    }

  };

  // =========================
  // FETCH MEDICINES
  // =========================

  const fetchMedicines = async () => {

    try {

      const response = await axios.get(
        "https://pharmavision-api.onrender.com/get_medicines"
      );

      if (Array.isArray(response.data)) {

        setMedicines(response.data);

      }

    } catch (error) {

      console.log(error);

    }

  };

  // =========================
  // ADD MEDICINE
  // =========================

  const addMedicine = async () => {

    try {

      const response = await axios.post(
        "https://pharmavision-api.onrender.com/add_medicine",
        {
          name,
          category,
          quantity,
          price,
          expiry_date: expiryDate
        }
      );

      if (response.data.success) {

        alert("Medicine Added");

        fetchMedicines();

        setName("");
        setCategory("");
        setQuantity("");
        setPrice("");
        setExpiryDate("");

      }

    } catch (error) {

      console.log(error);

    }

  };

  // =========================
  // DELETE MEDICINE
  // =========================

  const deleteMedicine = async (id) => {

    try {

      await axios.delete(
        `https://pharmavision-api.onrender.com/delete_medicine/${id}`
      );

      fetchMedicines();

    } catch (error) {

      console.log(error);

    }

  };

  // =========================
  // ADD TO BILL
  // =========================

  const addToBill = () => {

    if (!billMedicineId || !billQuantity) {

      alert("Select medicine and quantity");

      return;

    }

    const selectedMedicine = medicines.find(
      (m) => m.id === Number(billMedicineId)
    );

    if (!selectedMedicine) {

      return;

    }

    const total =
      selectedMedicine.price * billQuantity;

    const newItem = {
      medicine_id: selectedMedicine.id,
      name: selectedMedicine.name,
      quantity: billQuantity,
      price: selectedMedicine.price,
      total: total
    };

    setBillItems([...billItems, newItem]);

    setBillMedicineId("");
    setBillQuantity("");

  };

  // =========================
  // UPLOAD EXCEL
  // =========================

  const uploadExcel = async () => {

    if (!excelFile) {

      alert("Please select Excel File");

      return;

    }

    const formData = new FormData();

    formData.append("file", excelFile);

    try {

      const response = await axios.post(
        "https://pharmavision-api.onrender.com/upload_excel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data.success) {

        alert("Excel Uploaded");

        fetchMedicines();

      }

    } catch (error) {

      console.log(error);

    }

  };

  // =========================
  // MAIN UI
  // =========================

  if (loggedIn) {

    return (

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg,#0f172a,#111827,#1e293b)"
        }}
      >

        {/* SIDEBAR */}

        <div
          style={{
            width: "250px",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)",
            padding: "25px",
            color: "white"
          }}
        >

          <h1
            style={{
              marginBottom: "40px"
            }}
          >
            💊 PharmaVision
          </h1>

          <button
            onClick={() => setPage("dashboard")}
            style={sidebarButton}
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => setPage("inventory")}
            style={sidebarButton}
          >
            💉 Inventory
          </button>

          <button
            onClick={() => setPage("billing")}
            style={sidebarButton}
          >
            🧾 Billing
          </button>

        </div>

        {/* MAIN CONTENT */}

        <div
          style={{
            flex: 1,
            padding: "35px",
            color: "white"
          }}
        >

          {/* DASHBOARD */}

          {page === "dashboard" && (

            <>
              <div
                style={{
                  background:
                    "linear-gradient(135deg,#2563eb,#7c3aed)",
                  padding: "40px",
                  borderRadius: "25px",
                  marginBottom: "35px"
                }}
              >

                <h1
                  style={{
                    fontSize: "42px"
                  }}
                >
                  💊 PharmaVision Dashboard
                </h1>

                <p>
                  Smart Pharmacy Management System
                </p>

              </div>

              <div
                style={{
                  display: "flex",
                  gap: "25px",
                  flexWrap: "wrap"
                }}
              >

                <div
                  style={glassCard}
                  onClick={() => setPage("inventory")}
                >

                  <h2>📦 Inventory</h2>

                  <h1>{medicines.length}</h1>

                  <p>Total Medicines</p>

                </div>

                <div
                  style={glassCardGreen}
                  onClick={() => setPage("billing")}
                >

                  <h2>🧾 Billing</h2>

                  <h1>{billItems.length}</h1>

                  <p>Cart Items</p>

                </div>

                <div
                  style={glassCardPurple}
                  onClick={() => setPage("inventory")}
                >

                  <h2>📁 Excel Upload</h2>

                  <h1>AUTO</h1>

                  <p>Bulk Medicine Import</p>

                </div>

              </div>
            </>
          )}

          {/* INVENTORY */}

          {page === "inventory" && (

            <>
              <h1>Inventory Management</h1>

              <div style={sectionCard}>

                <h3>📁 Upload Excel</h3>

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) =>
                    setExcelFile(e.target.files[0])
                  }
                />

                <button
                  onClick={uploadExcel}
                  style={uploadButton}
                >
                  Upload Excel
                </button>

              </div>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  maxWidth: "400px"
                }}
              >

                <input
                  placeholder="Medicine Name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  style={dashboardInput}
                />

                <input
                  placeholder="Category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  style={dashboardInput}
                />

                <input
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                  style={dashboardInput}
                />

                <input
                  placeholder="Price"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  style={dashboardInput}
                />

                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) =>
                    setExpiryDate(e.target.value)
                  }
                  style={dashboardInput}
                />

                <button
                  onClick={addMedicine}
                  style={premiumButton}
                >
                  Add Medicine
                </button>

              </div>

              <input
                type="text"
                placeholder="🔍 Search Medicine"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                style={searchInput}
              />

              <table style={tableStyle}>

                <thead style={tableHeader}>

                  <tr>
                    <th style={tableHead}>Sr.No</th>
                    <th style={tableHead}>Name</th>
                    <th style={tableHead}>Category</th>
                    <th style={tableHead}>Quantity</th>
                    <th style={tableHead}>Price</th>
                    <th style={tableHead}>Expiry</th>
                    <th style={tableHead}>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {medicines
                    .filter((medicine) =>
                      medicine.name
                        ?.toLowerCase()
                        .includes(search.toLowerCase())
                    )
                    .map((medicine, index) => (

                      <tr key={medicine.id}>

                        <td style={tableData}>
                          {index + 1}
                        </td>

                        <td style={tableData}>
                          {medicine.name}
                        </td>

                        <td style={tableData}>
                          {medicine.category}
                        </td>

                        <td style={tableData}>
                          {medicine.quantity}
                        </td>

                        <td style={tableData}>
                          ₹{medicine.price}
                        </td>

                        <td style={tableData}>
                          {medicine.expiry_date}
                        </td>

                        <td style={tableData}>

                          <button
                            onClick={() =>
                              deleteMedicine(medicine.id)
                            }
                            style={deleteButton}
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </>
          )}

          {/* BILLING */}

          {page === "billing" && (

            <>
              <h1>🧾 Billing System</h1>

              <div
                style={{
                  display: "grid",
                  gap: "15px",
                  maxWidth: "400px"
                }}
              >

                <select
                  value={billMedicineId}
                  onChange={(e) =>
                    setBillMedicineId(e.target.value)
                  }
                  style={dashboardInput}
                >

                  <option value="">
                    Select Medicine
                  </option>

                  {medicines.map((medicine) => (

                    <option
                      key={medicine.id}
                      value={medicine.id}
                    >
                      {medicine.name}
                    </option>

                  ))}

                </select>

                <input
                  type="number"
                  placeholder="Quantity"
                  value={billQuantity}
                  onChange={(e) =>
                    setBillQuantity(e.target.value)
                  }
                  style={dashboardInput}
                />

                <button
                  onClick={addToBill}
                  style={uploadButton}
                >
                  Add To Bill
                </button>

              </div>

              <table
                style={{
                  width: "100%",
                  marginTop: "40px",
                  borderCollapse: "collapse",
                  background: "rgba(255,255,255,0.05)",
                  color: "white"
                }}
              >

                <thead style={tableHeader}>

                  <tr>
                    <th style={tableHead}>Medicine</th>
                    <th style={tableHead}>Quantity</th>
                    <th style={tableHead}>Price</th>
                    <th style={tableHead}>Total</th>
                  </tr>

                </thead>

                <tbody>

                  {billItems.map((item, index) => (

                    <tr key={index}>

                      <td style={tableData}>
                        {item.name}
                      </td>

                      <td style={tableData}>
                        {item.quantity}
                      </td>

                      <td style={tableData}>
                        ₹{item.price}
                      </td>

                      <td style={tableData}>
                        ₹{item.total}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

              <div
                style={{
                  marginTop: "25px",
                  padding: "20px",
                  borderRadius: "15px",
                  background:
                    "linear-gradient(135deg,#16a34a,#22c55e)",
                  width: "320px"
                }}
              >

                <h2>
                  Grand Total: ₹
                  {billItems.reduce(
                    (sum, item) =>
                      sum + item.total,
                    0
                  )}
                </h2>

              </div>

            </>
          )}

        </div>

      </div>

    );

  }

  // =========================
  // LOGIN PAGE
  // =========================

  return (

    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)"
        }}
      />

      <div
        style={{
          width: "420px",
          padding: "45px",
          borderRadius: "30px",
          backdropFilter: "blur(18px)",
          background: "rgba(255,255,255,0.12)",
          color: "white",
          zIndex: 1
        }}
      >

        <h1
          style={{
            textAlign: "center",
            fontSize: "42px"
          }}
        >
          💊 PharmaVision
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          style={premiumInput}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={premiumInput}
        />

        <button
          onClick={handleLogin}
          style={premiumButton}
        >
          Login
        </button>

      </div>

    </div>
  );
}

// =========================
// STYLES
// =========================

const sidebarButton = {
  width: "100%",
  padding: "14px",
  marginTop: "15px",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  textAlign: "left",
  fontSize: "15px"
};

const glassCard = {
  width: "280px",
  padding: "30px",
  borderRadius: "25px",
  cursor: "pointer",
  color: "white",
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(18px)"
};

const glassCardGreen = {
  width: "280px",
  padding: "30px",
  borderRadius: "25px",
  cursor: "pointer",
  color: "white",
  background:
    "linear-gradient(135deg,#16a34a,#22c55e)"
};

const glassCardPurple = {
  width: "280px",
  padding: "30px",
  borderRadius: "25px",
  cursor: "pointer",
  color: "white",
  background:
    "linear-gradient(135deg,#7c3aed,#a855f7)"
};

const premiumInput = {
  width: "100%",
  padding: "15px",
  marginBottom: "20px",
  borderRadius: "12px",
  border: "none",
  outline: "none",
  background: "rgba(255,255,255,0.18)",
  color: "white",
  fontSize: "16px"
};

const premiumButton = {
  width: "100%",
  padding: "15px",
  borderRadius: "12px",
  border: "none",
  background:
    "linear-gradient(135deg,#00c6ff,#0072ff)",
  color: "white",
  fontSize: "18px",
  cursor: "pointer"
};

const uploadButton = {
  padding: "12px 20px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer"
};

const dashboardInput = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.15)",
  outline: "none",
  fontSize: "15px",
  background: "rgba(255,255,255,0.08)",
  color: "white"
};

const searchInput = {
  width: "320px",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  marginTop: "30px",
  marginBottom: "20px",
  outline: "none",
  fontSize: "15px",
  background: "rgba(255,255,255,0.08)",
  color: "white"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "rgba(255,255,255,0.05)",
  borderRadius: "15px",
  overflow: "hidden",
  color: "white"
};

const tableHeader = {
  background: "#2563eb",
  color: "white"
};

const tableHead = {
  padding: "15px"
};

const tableData = {
  padding: "14px",
  textAlign: "center",
  borderBottom:
    "1px solid rgba(255,255,255,0.08)"
};

const deleteButton = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "8px",
  cursor: "pointer"
};

const sectionCard = {
  marginTop: "20px",
  marginBottom: "30px",
  background: "rgba(255,255,255,0.08)",
  padding: "20px",
  borderRadius: "15px"
};

export default App;