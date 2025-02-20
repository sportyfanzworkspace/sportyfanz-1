const http = require("http");
const app = require("./server/server.js"); // Import Express app from server.js


const port = 5000;

const server = http.createServer(app); // Use Express app

server.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
});
