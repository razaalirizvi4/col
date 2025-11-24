require('dotenv').config();
const express = require('express');

const Joi = require('joi');

const sql = require('mssql');

const sqlConfig = {
    server: process.env.SERVER_NAME,
    database: process.env.DB_NAME,
    user: process.env.USER,
    password: process.env.PASSWORD,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    driver: 'tedious'
};




const app = express();
app.use(express.json());

//array for all genres

const genres = [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Comedy' },
    { id: 3, name: 'Drama' },
    { id: 4, name: 'Fantasy' },
    { id: 5, name: 'Horror' },
    { id: 6, name: 'Mystery' },
    { id: 7, name: 'Romance' },
    { id: 8, name: 'Sci-Fi' },
    { id: 9, name: 'Thriller' },
    { id: 10, name: 'Western' }
];

//display all genres
app.get('/api/genres/', (req, res) => {
    // res.send(genres);
    sql.connect(sqlConfig, function (err) {
        if (err) console.log(err);
        else {
            var request = new sql.Request();
            request.query('SELECT * FROM movies', function (err, recordset) {
                if (err) res.status(400).send(err)
                else res.send(recordset);
            });
        }
    });
});

//display single genre
app.get('/api/genres/:id', (req, res) => {
    let g = genres.find(c => c.id === parseInt(req.params.id))
    if (!g) {
        return res.status(404).send('Genre with that ID doesnt exist');
    }
    sql.connect(sqlConfig, (err) => {
        if (err) {
            res.status(400).send(err);
        }
        else {
            var request = new sql.Request();
            request.query('SELECT * FROM Users WHERE User_ID = ' + req.params.id, (err, recordset) => {
                if (err) res.status(400).send(err);
                else res.send(recordset);
        });
    }});
});

//add a new genre
function validateGenre(genre) {
    const schema = Joi.object({
        id : Joi.required(),
        name : Joi.string().min(5).required()
    });
    return schema.validate(genre);
}

app.post('/api/genres', (req, res) => {
    const {error} = validateGenre(req.body);
    if (error) {
        return res.status(400).send(error.message[0].message);
    }
    const newGenre = {id : genres.length + 1, name : req.body.name};
    genres.push(newGenre);
    res.send(genres);
});


//update a genre
app.put('/api/genres/:id', (req, res) => {
    const {error} = validateGenre(req.body);

    let g = genres.find(g => g.id === parseInt(req.body.id));
    if (!g) {
        res.status(404).send('Object Not Found');
    }

    if (error) {
        return res.status(400).send(error.message[0].message);
    }

    const i = genres.findIndex(g => g.id === parseInt(req.body.id));
    genres[i].name = req.body.name;
});

//delete a genre
app.delete('/api/genres/:id', (req, res) => {

    let g = genres.find(g => g.id === parseInt(req.params.id));
    if (!g) {
        return res.status(404).send('Object Not Found');
    }

   

    const i = genres.findIndex(g => g.id === parseInt(req.params.id));
    genres.splice(i, 1);
    res.send(genres);
});


app.listen(3000);