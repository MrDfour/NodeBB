const fs = require('fs');
const path = require('path');
const { execSync, fork } = require('child_process');

const configFile = path.join(__dirname, 'config.json');

// Si no existe config.json en el contenedor, lo creamos dinámicamente con las variables de Render
if (!fs.existsSync(configFile)) {
  const config = {
    url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 10000}`,
    secret: process.env.COOKIE_SECRET || 'secret-nodebb-key',
    database: 'mongo',
    mongo: {
      uri: process.env.MONGODB_URI,
    },
    port: process.env.PORT || 10000
  };

  // Si estás usando Redis en Render para la sesión/cache
  if (process.env.REDIS_URI) {
    config.redis = {
      uri: process.env.REDIS_URI
    };
  }

  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  console.log('config.json generado correctamente.');
}

// Ejecutar el build/setup de NodeBB de forma desatendida
try {
  console.log('Ejecutando build de NodeBB...');
  execSync('node app.js --build', { stdio: 'inherit' });
} catch (e) {
  console.error('Error durante el build de NodeBB:', e);
}

// Arrancar el proceso principal de NodeBB
console.log('Iniciando NodeBB...');
fork('app.js');
