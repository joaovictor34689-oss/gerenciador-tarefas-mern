require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Configure MONGODB_URI e JWT_SECRET no arquivo backend/.env.');
  process.exit(1);
}

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log('Servidor iniciado na porta ' + PORT + '.');
    });
  } catch (error) {
    console.error('Não foi possível conectar ao MongoDB:', error.name);
    process.exit(1);
  }
}

startServer();
