const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
// Cargar los certificados SSL
const privateKey = fs.readFileSync('ssl-cert-snakeoil.key', 'utf8');
const certificate = fs.readFileSync('ssl-cert-snakeoil.pem', 'utf8');
//const ca = fs.readFileSync('/ruta/a/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate
};

// Configurar Mercadopago
mercadopago.configure({
    access_token: "TEST-4798754970937613-041720-cd7aa86b4def541abbee5ba18a204d92-133839272",
});

// Configurar middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("../../client/html-js"));
app.use(cors());

app.get("/", function (req, res) {
    res.status(200).sendFile("index.html");
});

app.post("/create_preference", (req, res) => {
    let preference = {
        items: [
            {
                title: req.body.description,
                unit_price: Number(req.body.price),
                quantity: Number(req.body.quantity),
            }
        ],
        back_urls: {
            "success": "https://192.168.1.48:8080/feedback",
            "failure": "https://192.168.1.48:8080/feedback",
            "pending": "https://192.168.1.48:8080/feedback"
        },
        auto_return: "approved",
    };

    mercadopago.preferences.create(preference)
        .then(function (response) {
            res.json({
                id: response.body.id
            });
        }).catch(function (error) {
            console.log(error);
        });
});

app.get('/feedback', function (req, res) {
    res.json({
        Payment: req.query.payment_id,
        Status: req.query.status,
        MerchantOrder: req.query.merchant_order_id
    });
});

// Crear el servidor HTTPS
const httpsServer = https.createServer(credentials, app);

// Escuchar en el puerto 8080
httpsServer.listen(8080, () => {
    console.log("Servidor HTTPS funcionando en el puerto 8080");
});

// Crear el servidor HTTP
const httpApp = express();

// Redirigir todas las solicitudes HTTP a HTTPS
httpApp.get('*', (req, res) => {
    res.redirect(`https://${req.headers.host}:8080${req.url}`);
});

// Escuchar en el puerto 8081
http.createServer(httpApp).listen(8081, () => {
    console.log('Redireccionador HTTP funcionando en el puerto 8081');
});
