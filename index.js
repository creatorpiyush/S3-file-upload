const express = require('express');
const app = express();
require('dotenv').config();
const multer = require('multer');
const AWS = require('aws-sdk');

app.set('json spaces', 5);

const PORT = process.env.PORT;

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index');
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
    const file = req.file;

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    try {
        await s3.upload(params).promise();
        res.status(200).send('File uploaded to S3 successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading file to S3');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`);
})