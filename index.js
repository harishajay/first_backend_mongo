import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import User from "./models/User.js";

dotenv.config(); // load .env
const app = express();
app.use(express.json());

console.log('Server setup complete');

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
      console.log('Root route was hit');
      res.send('Hello, Harish i hope you are doing well!');
    });

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
})
app.post('/users', async (req, res) => {
  try {
    const { name, age } = req.body;

    if (!name || !age) { 
      return res.status(400).json({error: 'Name and age are required'});
    }
    console.log('Received user data:', { name, age });

    const newUser = new User(req.body);

    const savedUser = await newUser.save();
    
    console.log('User saved to DB:', savedUser);

    res.status(201).json({ message: 'User created successfully', user: savedUser });
    
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({error: 'Failed to create user'});
  }
});

app.put('/users/email', async (req, res) => {
  try {
    const { email, name } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { name },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/users/delete', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { $unset: { name: "" } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Name field deleted successfully',
      user
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to delete name field' });
  }
});

async function startServer() {
  try {

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // optional: exit if DB connection fails
  }
}
console.log("Server setup complete");
startServer();

