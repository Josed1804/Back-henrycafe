const express = require('express');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;



app.use(cors());
app.use(express.json());

// Configura tu conexión a la base de datos
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Jose1997',
  port: 5432,
});

client.connect();

// Función para autenticar al usuario en base de datos o cualquier otro método que utilices
const authenticateUser = async (email, pswd, number, address) => {
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 AND pswd = $2 AND whatsapp = $3 AND address = $4',
      [email, pswd, number, address]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error al autenticar usuario:', error);
    throw error;
  }
};


// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: err.message
  });
});

app.get('/', (req, res) => {
  //muestrame aca la pahina del home redirecciona
  res.send('¡Bienvenido al servidor backend!');
  console.log('Backen funcionando');
});


// Endpoint para registrar un nuevo usuario
app.post('/api/signup', async (req, res) => {
  try {
    const { nombre, email, pswd, number, address } = req.body;

    // Log para imprimir detalles de la solicitud
    console.log('Detalles de la solicitud:', { nombre, email, pswd, number, address });

    // Realiza la inserción en la base de datos
    const result = await client.query(
      'INSERT INTO users (name, email, pswd,  wapp, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, email, pswd, number, address] // Agregamos number y address como nuevos valores a insertar
    );

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// En tu servidor Express
app.post('/api/signin', async (req, res) => {
  try {
    const { email, pswd } = req.body;

    // Realiza la autenticación en la base de datos o donde almacenes las credenciales
    const user = await authenticateUser(email, pswd);

    if (user) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, error: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});

