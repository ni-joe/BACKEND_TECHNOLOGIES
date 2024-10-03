const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const dataFilePath = path.join(__dirname, 'employees.txt');

app.use(bodyParser.json());
app.use(express.static(__dirname)); 

const loadData = () => {
    try {
        const dataBuffer = fs.readFileSync(dataFilePath, 'utf-8');
        const dataArray = dataBuffer.split('\n').filter(line => line.trim() !== ''); 
        return dataArray.map(line => JSON.parse(line));
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
};

const saveData = (data) => {
    try {
        const dataString = data.map(item => JSON.stringify(item)).join('\n');
        fs.writeFileSync(dataFilePath, dataString);
    } catch (error) {
        console.error('Error saving data:', error);
    }
};

app.post('/employees', (req, res) => {
    const newData = req.body;
    const data = loadData();
    data.push(newData);
    saveData(data);
    res.status(201).send(newData);
});

app.get('/employees', (req, res) => {
    const data = loadData();
    res.send(data);
});

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

app.delete('/employees/:id', (req, res) => {
    const { id } = req.params;
    let data = loadData();
    data = data.filter((item) => item.emp_id !== id);
    saveData(data);
    res.status(204).send();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
