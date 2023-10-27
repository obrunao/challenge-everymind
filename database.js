const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.join(__dirname, 'database.sqlite'); // Caminho para o arquivo do banco de dados

// Crie uma nova instância do banco de dados ou abra a existente
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log('Banco de dados SQLite conectado com sucesso.');
    // Crie suas tabelas e execute outras operações aqui, se necessário
  }
});

// Exporte o objeto de banco de dados para uso em outros lugares
module.exports = db;
