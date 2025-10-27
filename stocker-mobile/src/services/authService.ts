
// In a real app, you would use a library like axios to make API calls

export const login = (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === 'test' && password === 'password') {
        resolve({
          user: { name: 'Test User' },
          token: 'fake-token',
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};
