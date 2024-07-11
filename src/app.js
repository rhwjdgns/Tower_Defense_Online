import express from 'express';
import { createServer } from 'http';

const app = express();
const server = createServer(app);

const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('client'));

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
