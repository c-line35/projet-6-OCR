const express = require('express');
const mongoose = require('mongoose');
const app = express();

const cors = require('cors');

require('dotenv').config();

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce')

const path = require('path');

app.use(express.json());
app.use(cors());

mongoose.connect(`mongodb+srv://${process.env.ID_MONGOOSE}:${process.env.PASSWORD_MONGOOSE}@cluster0.nqch5.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !')); 


app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));



module.exports = app;