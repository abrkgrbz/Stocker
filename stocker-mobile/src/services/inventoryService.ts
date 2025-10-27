
export const getInventory = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Laptop', quantity: 10 },
        { id: 2, name: 'Keyboard', quantity: 25 },
        { id: 3, name: 'Mouse', quantity: 50 },
        { id: 4, name: 'Monitor', quantity: 15 },
      ]);
    }, 1000);
  });
};
