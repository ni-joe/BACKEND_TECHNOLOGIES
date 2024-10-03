const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const dataFilePath = path.join(__dirname, 'employees.json'); // Path to your employees.json file

app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// Load data from JSON file
const loadData = () => {
    try {
        const dataBuffer = fs.readFileSync(dataFilePath);
        return JSON.parse(dataBuffer.toString());
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
};

// Save data to JSON file
const saveData = (data) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
};

// Create (POST)
app.post('/employees', (req, res) => {
    const newData = req.body;
    const data = loadData();
    data.push(newData);
    saveData(data);
    res.status(201).send(newData);
});

// Read (GET)
app.get('/employees', (req, res) => {
    const data = loadData();
    res.send(data);
});

// Update (PUT)
app.put('/employees/:id', (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    let data = loadData();
    const employeeIndex = data.findIndex(emp => emp.emp_id === id);

    if (employeeIndex > -1) {
        data[employeeIndex] = updatedData;
        saveData(data);
        res.send(updatedData);
    } else {
        res.status(404).send('Employee not found');
    }
});

// Delete (DELETE)
app.delete('/employees/:id', (req, res) => {
    const { id } = req.params;
    let data = loadData();
    data = data.filter((item) => item.emp_id !== id);
    saveData(data);
    res.status(204).send();
});

// Serve the index.html file at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});