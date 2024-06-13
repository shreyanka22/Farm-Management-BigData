const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Atlas connection string
const db = 'mongodb+srv://shrey:shrey%40123@cluster0.pnymw1z.mongodb.net/FarmManagementDB?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    type: String
});

const Product = mongoose.model('Product', productSchema);

// Create a sample admin user
const createSampleUser = async () => {
    try {
        const user = await User.findOne({ username: 'admin' });
        if (!user) {
            const newUser = new User({ username: 'admin', password: 'admin' });
            await newUser.save();
            console.log('Admin user created.');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

createSampleUser();

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Register Route
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Create Product
app.post('/api/products', (req, res) => {
    const newProduct = new Product(req.body);
    newProduct.save()
        .then(product => res.json(product))
        .catch(err => res.status(400).json({ success: false, message: 'Error adding product', error: err }));
});

// Read All Products
app.get('/api/products', (req, res) => {
    Product.find()
        .then(products => res.json(products))
        .catch(err => res.status(400).json({ success: false, message: 'Error fetching products', error: err }));
});

// Update Product
app.put('/api/products/:id', (req, res) => {
    Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(product => res.json(product))
        .catch(err => res.status(400).json({ success: false, message: 'Error updating product', error: err }));
});

// Delete Product
app.delete('/api/products/:id', (req, res) => {
    Product.findByIdAndDelete(req.params.id)
        .then(() => res.json({ success: true }))
        .catch(err => res.status(400).json({ success: false, message: 'Error deleting product', error: err }));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
