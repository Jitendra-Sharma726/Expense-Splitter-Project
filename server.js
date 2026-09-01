import express from "express";
import cors from "cors";

const app = express();

// Middlewares
// Parse JSON request bodies
app.use(express.json());
// Enable cross-origin requests
app.use(cors()); 

// Route: POST /calculate
app.post("/calculate", (req, res) => {
  const { people, expenses } = req.body;

  // Validation
  if (!people || !expenses) {
    return res.status(400).json({ error: "Missing people or expenses data." });
  }

  // Step 1: Calculate total expense
  let total = 0;
  for (let i = 0; i < expenses.length; i++) {
    // Add each expense amount to total
    total += expenses[i].amount; 
  }

  // Step 2: Calculate equal share for each person
  let share = 0;
  if (people.length > 0) {
    // Divide total by number of people
    share = total / people.length; 
  }

  // Step 3: Compute balances for each participant
  // Array to store result for each person
  const balances = []; 

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    let paid = 0;

    // Calculate how much this person paid
    for (let j = 0; j < expenses.length; j++) {
      const expense = expenses[j];
      if (expense.payer === person) {
        paid += expense.amount;
      }
    }

    // Calculate balance (positive = gets back, negative = owes)
    const balance = paid - share;

    // Store the result for this person
    balances.push({ name: person, paid, balance });
  }

  // Send the final result as JSON
  res.json({
    total,
    share,
    balances,
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

