const http = require('http');

const app = require('./app');
const PORT = process.env.PORT;


const server = http.createServer(app);

async function startServer(){

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });

}

startServer();