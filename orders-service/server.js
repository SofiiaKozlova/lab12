const express = require("express");

const app = express();

app.use(express.json());

const USERS_URL =
  process.env.USERS_SERVICE_URL ||
  "http://users-service.railway.internal:3001";

const PRODUCTS_URL =
  process.env.PRODUCTS_SERVICE_URL ||
  "http://products-service.railway.internal:3002";

const orders = [];
let nextId = 1;

// Створення замовлення
app.post("/orders", async (req, res) => {
  const { userId, productId } = req.body;

  try {
    // Отримання користувача
    const userResponse = await fetch(
      `${USERS_URL}/users/${userId}`
    );

    if (!userResponse.ok) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Отримання продукту
    const productResponse = await fetch(
      `${PRODUCTS_URL}/products/${productId}`
    );

    if (!productResponse.ok) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const user = await userResponse.json();
    const product = await productResponse.json();

    const order = {
      id: nextId++,
      userId,
      productId,
      userName: user.name,
      productName: product.name,
      price: product.price,
      createdAt: new Date().toISOString(),
    };

    orders.push(order);

    res.status(201).json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// Отримання всіх замовлень
app.get("/orders", (req, res) => {
  res.json(orders);
});

app.listen(3003, () => {
  console.log("Orders Service running on port 3003");
});