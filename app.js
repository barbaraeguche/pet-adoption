
//crucial
const port = 5195;
const path = require('path');
const multer = require('multer');
const express = require('express');
const session = require('express-session');
const app = express();

//store image files
const storage = multer.memoryStorage();
const upload = multer( {storage: storage} );

//database
const { MongoClient, Binary } = require('mongodb');
const mongoDB = process.env.MONGODB_URI;
const client = new MongoClient(mongoDB);
const db = client.db(process.env.MONGODB_DB_URI);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
    }
}
connectToMongoDB();

//needed
const pages = ['home', 'find', 'cat', 'dog', 'give', 'contact', 'signin'];
const loginMsgs = ['has been successfully created.', 'exists, but password doesn\'t match.', 'has been successfully logged in.'];

//middleware
app.set('view engine', 'ejs'); //set the view engine to EJS
app.use(
    express.json(), //parse json bodies
    express.urlencoded({ extended: false }), //parse url-encoded bodies
    express.static(path.join(__dirname, 'public')), //serve static files from the "public" directory
    session({
        secret: 'TbDwE2JH5jWsN6uPzFhYp',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);

//render pages
pages.forEach(page => {
    if(page === 'find'|| page === 'give') {
        app.get(`/${page}`, requireLogin, (req, res) => {
            res.render(page);
        });
    } else {
        app.get(`/${page}`, (req, res) => {
            res.render(page);
        });
    }
});

//find pet
app.post('/findpet', async (req, res) => {
    const body = req.body;
    const age = body['age'], breed = body['breed'], gender = body['gender'], symbiosis = capitalize(body['symbiosis']), type = body['type'];

    try {
        const collection = db.collection('pet-info');

        const query = {
            age: age === 'noage'? {$exists: true} : {$regex: `^${age}$`, $options: 'i'},
            breed: {$regex: `^${breed}$`, $options: 'i'},
            gender: gender === 'nogender'? {$exists: true} : {$regex: `^${gender}$`, $options: 'i'},
            symbiosis: {$regex: `^${symbiosis}$`, $options: 'i'},
            type: {$regex: `^${type}$`, $options: 'i'},
        };
        const filteredPets = await collection.find(query, {projection: { _id: false, email: false, fname: false, lname: false }}).toArray();

        filteredPets.forEach((doc) => {
            doc.image = `data:image/jpeg;base64, ${doc.image.toString('base64')}`
        });
        const validPets = filteredPets.length === 0
            ? {msg: 'No pets found matching your search criteria.'}
            : {pets: filteredPets};

        return res.render('display_pets', { validPets });
    } catch(err) {
        console.error('Error fetching posts', err);
        return res.status(500).send('Internal Server Error');
    }
});

//rehome pet
app.post('/rehome', upload.single('image'), async (req, res) => {
    const body = req.body;

    try {
        const collection = db.collection('pet-info');

        const imageBuffer = req.file? req.file.buffer : null;
        const imageBinary = imageBuffer? new Binary(imageBuffer) : null;
        const symbiosis = body['symbiosis'].includes(',')? body['symbiosis'].split(',') : body['symbiosis'];

        const petInfo = {
            age: capitalize(body['age']),
            breed: capitalize(body['breed']),
            desc: capitalize(body['text']),
            email: body['own-email'],
            fname: capitalize(body['own-fname']),
            gender: capitalize(body['gender']),
            image: imageBinary,
            lname: capitalize(body['own-lname']),
            name: capitalize(body['name']),
            symbiosis: capitalize(symbiosis),
            type: capitalize(body['type'])
        };
        await collection.insertOne(petInfo);

        const returnMsg = { msg: 'Your pet has been successfully given up for adoption, and will appear on our website soon.' };
        return res.render('adopt_success', { returnMsg });
    } catch(err) {
        console.error('Error fetching posts', err);
        return res.status(500).send('Internal Server Error');
    }
});

//register user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const collection = db.collection('users');

        const findUser = await collection.findOne( {username: username}, {projection: {_id: false} } );

        if(findUser !== null) {
            const oneUser = findUser.username === username && findUser.password === password;
            const returnMsg = oneUser? { name: username, msg: loginMsgs[2] } : { name: username, msg: loginMsgs[1] };

            if(oneUser) {
                req.session.user = username;
            }
            return res.render('signin_ans', { returnMsg });
        }

        const newUser = { password: password, username: username };
        await collection.insertOne(newUser);

        const returnMsg = { name: username, msg: loginMsgs[0] };
        req.session.user = username;

        return res.render('signin_ans', { returnMsg });
    } catch(err) {
        console.error('Error fetching posts', err);
        return res.status(500).send('Internal Server Error');
    }
});

//log out
app.get('/logout', requireLogin, (req, res) => {
    res.render('logout');

    if(req.session.user) {
        req.session.destroy(err => {
            if(err) {
                return res.status(500).send('Error in logging out');
            }
        });
    }
});

//start the server
app.listen(port, () => console.log(`Server running on http://localhost:${port}/home`));

//--------------------  START OF MY FUNCTIONS  --------------------//
function capitalize(text) {
    if(Array.isArray(text)) {
        text[0] = text[0].charAt(0).toUpperCase() + text[0].slice(1);
        return `${text.slice(0, -1).join(', ')} & ${text.slice(-1)}.`;
    }
    return (text.charAt(0).toUpperCase() + text.slice(1));
}

function requireLogin(req, res, next) {
    return (req.session && req.session.user)? next() : res.redirect('/signin');
}
//--------------------  END OF MY FUNCTIONS  --------------------//