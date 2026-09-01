import { useState } from "react";
import "./App.css";

// ------------ Function to determine backend domain dynamically ------------
// You don't need to understand this function, it's just a helper function to get the backend domain
function getBackendDomain() {
  const domain = window.location.hostname || window.currentURL;
  const protocolPrefix = "https://";
  const firstDotIndex = domain.indexOf('.');
  const subdomain = domain.substring(0, firstDotIndex);
  const restOfDomain = domain.substring(firstDotIndex);
  return protocolPrefix + subdomain + "-backend" + restOfDomain;
}
// ---------------------------------------------------------------------------

function App() {
  const [people, setPeople] = useState([]);
  const [personName, setPersonName] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [payer, setPayer] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);

  const backendDomain = getBackendDomain();

  const addPerson = () => {
    if (!personName.trim()) {
      alert("Please enter a name");
      return;
    }
    if (people.includes(personName)) {
      alert("Person already added");
      return;
    }
    setPeople([...people, personName]);
    setPersonName("");
  };

  const addExpense = () => {
    if (!payer || !amount) {
      alert("Please select payer and amount");
      return;
    }
    
    const numAmount = Number(amount);

    if (numAmount < 0 || isNaN(numAmount)) {
      alert("Negative amount or invalid value not allowed");
      return;
    }
    
    setExpenses([...expenses, { payer, amount: numAmount }]);
    setAmount("");
  };

  const calculate = async () => {
    try {
      const response = await fetch(`${backendDomain}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ people, expenses }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error calculating:", error);
      alert("Failed to connect to backend");
    }
  };

  return (
    <div className="container">
      <h1>💸 Expense Splitter</h1>

      {/* Add Participants */}
      <div className="section">
        <h3>Add Participants</h3>
        <input
          type="text"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="Enter name"
        />
        <button onClick={addPerson}>Add</button>
        <ul>
          {people.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>

      {/* Add Expenses */}
      {people.length > 0 && (
        <div className="section">
          <h3>Add Expense</h3>
          <select value={payer} onChange={(e) => setPayer(e.target.value)}>
            <option value="">Select payer</option>
            {people.map((p, i) => (
              <option key={i} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min='0'
          />
          <button onClick={addExpense}>Add Expense</button>

          <ul>
            {expenses.map((exp, i) => (
              <li key={i}>
                {exp.payer} paid ₹{exp.amount}
              </li>
            ))}
          </ul>

          {expenses.length > 0 && (
            <button onClick={calculate}>Calculate</button>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="section">
          <h3>Results</h3>
          <p>Total Expense: ₹{result.total}</p>
          <p>Each person should pay: ₹{result.share.toFixed(2)}</p>

          <ul>
            {result.balances.map((b, i) => (
              <li key={i}>
                {b.name} {b.balance > 0 ? "gets back" : "owes"} ₹
                {Math.abs(b.balance).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;

