export async function checkoutOrder(data, token) {
  const res = await fetch("http://localhost:5230/api/Checkout/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Checkout failed");
  return res.json();
}
