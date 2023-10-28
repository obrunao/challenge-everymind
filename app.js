const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'styles')));

const db = new sqlite3.Database('database.sqlite');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'everymind', // Substitua por uma chave secreta segura
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs'); // Configura o mecanismo de visualização EJS
app.set('views', path.join(__dirname, 'views'));

app.get('/cadastro', (req, res) => {
  res.sendFile('cadastro.html', { root: path.join(__dirname, 'views') });
});

app.get('/styles/cadastro.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('cadastro.css', { root: path.join(__dirname, 'styles') });
});

app.get('/styles/vagas-disponiveis.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('vagas-disponiveis.css', { root: path.join(__dirname, 'styles') });
});



db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      nomeCompleto TEXT,
      telefone TEXT,
      cpf TEXT,
      localizacao TEXT, 
      vulnerabilidade TEXT,
      email TEXT,
      senha TEXT
    )
  `);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS user_vagas (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      vaga_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (vaga_id) REFERENCES vagas(id)
    )
  `);
});

app.post('/cadastro', (req, res) => {
  const nomeCompleto = req.body.nomeCompleto;
  const telefone = req.body.telefone;
  const cpf = req.body.cpf;
  const vulnerabilidade = req.body.vulnerabilidade;
  const email = req.body.email;
  const senha = req.body.senha;
  const localizacao = req.body.localizacao;


  // Inserir os dados no banco de dados SQLite
  db.run(
    'INSERT INTO users (nomeCompleto, telefone, cpf, vulnerabilidade, email, senha, localizacao) VALUES (?, ?, ?, ?, ?, ?, ?)', // Adicione a localização
    [nomeCompleto, telefone, cpf, vulnerabilidade, email, senha, localizacao], // Adicione a localização
    function (err) {
      if (err) {
        return console.error(err.message);
      }
      console.log(`Registro inserido com sucesso, ID: ${this.lastID}`);

      // Redirecione o usuário para a página de login
      res.redirect('/login');
    }
  );
});

app.get('/teste', (req, res) => {
  res.sendFile('teste.html', { root: path.join(__dirname, 'views') });
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: path.join(__dirname, 'views') });
});

app.get('/styles/login.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('login.css', { root: path.join(__dirname, 'styles') });
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;

  // Verifique o domínio do e-mail
  if (email.endsWith('@everymind.com.br')) {
    // Se o e-mail terminar com "@everymind.com.br", redirecione para a página da empresa
    res.redirect('/empresa-pagina-inicial');
  } else {
    // Caso contrário, redirecione para a página do candidato
    db.get('SELECT id, nomeCompleto FROM users WHERE email = ? AND senha = ?', [email, senha], (err, row) => {
      if (err) {
        return console.error(err.message);
      }

      if (row) {
        // Autenticação bem-sucedida
        // Salve o nome do usuário na sessão
        req.session.nomeUsuario = row.nomeCompleto;
        req.session.emailUsuario = email; // Salva o email do usuário na sessão
        req.session.userId = row.id; // Salva o ID do usuário na sessão

        // Redirecione o usuário para a página do candidato
        res.redirect('/candidato-pagina-inicial');
      } else {
        // Credenciais inválidas
        // Redirecione o usuário de volta para a página de login com uma mensagem de erro
        res.redirect('/login?erro=credenciais-invalidas');
      }
    });
  }
});



app.get('/esqueceu-senha', (req, res) => {
  res.sendFile('esqueceu-senha.html', { root: path.join(__dirname, 'views') });
});

app.get('/candidato-pagina-inicial', (req, res) => {
  res.sendFile('candidato-pagina-inicial.html', { root: path.join(__dirname, 'views') });
});



app.get('/dashboard', (req, res) => {
  res.sendFile('dashboard.html', { root: path.join(__dirname, 'views') });
});

app.get('/entrevistas', (req, res) => {
  res.sendFile('entrevistas.html', { root: path.join(__dirname, 'views') });
});

app.get('/minhas-vagas', (req, res) => {
  res.sendFile('minhas-vagas.html', { root: path.join(__dirname, 'views') });
});

app.get('/perfil', (req, res) => {
  res.sendFile('perfil.html', { root: path.join(__dirname, 'views') });
});

app.get('/empresa-pagina-inicial', (req, res) => {
  res.sendFile('empresa-pagina-inicial.html', { root: path.join(__dirname, 'views') });
});

app.get('/cadastrar-vaga', (req, res) => {
  res.sendFile('cadastrar-vaga.html', { root: path.join(__dirname, 'views') });
});

app.get('/styles/candidato.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('candidato.css', { root: path.join(__dirname, 'styles') });
});

app.get('/styles/cadastro.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('cadastro.css', { root: path.join(__dirname, 'styles') });
});
app.get('/styles/cadastrar-vaga.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('cadastrar-vaga.css', { root: path.join(__dirname, 'styles') });
});


db.serialize(() => {
  // Cria a tabela de vagas se ela não existir
  db.run(`
    CREATE TABLE IF NOT EXISTS vagas (
      id INTEGER PRIMARY KEY,
      titulo TEXT,
      descricao TEXT,
      salario TEXT,
      vulnerabilidade TEXT,
      tipo_trabalho TEXT,
      localizacao TEXT,
      competencias TEXT
    )
  `);
});

app.post('/cadastrar-vaga', (req, res) => {
  // Primeiro, obtenha o ID do usuário da sessão
  const userId = req.session.userId;



  const titulo = req.body.titulo;
  const descricao = req.body.descricao;
  const salario = req.body.salario;
  const vulnerabilidade = req.body.vulnerabilidade;
  const tipo_trabalho = req.body.tipo_trabalho;
  const localizacao = req.body.localizacao;
  const competencias = req.body.competencias;

  // Inserir os dados da vaga no banco de dados SQLite
  db.run(
    'INSERT INTO vagas (titulo, descricao, salario, vulnerabilidade, tipo_trabalho, localizacao, competencias) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [titulo, descricao, salario, vulnerabilidade, tipo_trabalho, localizacao, competencias],
    function (err) {
      if (err) {
        return console.error(err.message);
      }
      const vagaId = this.lastID;

      // Agora, insira o relacionamento entre o usuário e a vaga na tabela user_vagas
      db.run(
        'INSERT INTO user_vagas (user_id, vaga_id) VALUES (?, ?)',
        [userId, vagaId],
        function (err) {
          if (err) {
            return console.error(err.message);
          }
          console.log(`Vaga cadastrada com sucesso, ID: ${vagaId}`);
          console.log(`Relacionamento criado na tabela user_vagas.`);
          // Redirecione o usuário para onde desejar após o cadastro da vaga
          res.redirect('/vagas-cadastradas');
        }
      );
    }
  );
});

app.get('/vagas-cadastradas', (req, res) => {
  db.all('SELECT * FROM vagas', (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Erro ao buscar vagas.');
    }

    res.render('vagas-cadastradas', { vagas: rows }); // Renderiza a página EJS com os dados das vagas
  });
});

app.get('/vagas-disponiveis', (req, res) => {
  db.all('SELECT * FROM vagas', (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Erro ao buscar vagas.');
    }

    res.render('vagas-disponiveis', { vagas: rows }); // Renderiza a página EJS com os dados das vagas
  });
});

app.get('/styles/vagas-cadastradas.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('vagas-cadastradas.css', { root: path.join(__dirname, 'styles') });
});

app.get('/entrevistas-candidato', (req, res) => {
  res.sendFile('entrevistas-candidato.html', { root: path.join(__dirname, 'views') });
});

app.get('/entrevistas-empresa', (req, res) => {
  res.sendFile('entrevistas-empresa.html', { root: path.join(__dirname, 'views') });
});

app.get('/dashboard-candidato', (req, res) => {
  res.sendFile('dashboard-candidato.html', { root: path.join(__dirname, 'views') });
});

app.get('/dashboard-empresa', (req, res) => {
  res.sendFile('dashboard-empresa.html', { root: path.join(__dirname, 'views') });
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS candidaturas (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      vaga_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (vaga_id) REFERENCES vagas(id)
    )
  `);
});

// 1. Verifique se o usuário fez login com sucesso
app.post('/login', (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;

  // Verifique o domínio do e-mail
  if (email.endsWith('@everymind.com.br')) {
    // Se o e-mail terminar com "@everymind.com.br", redirecione para a página da empresa
    res.redirect('/empresa-pagina-inicial');
  } else {
    // Caso contrário, redirecione para a página do candidato
    db.get('SELECT id, nomeCompleto FROM users WHERE email = ? AND senha = ?', [email, senha], (err, row) => {
      if (err) {
        return console.error(err.message);
      }

      if (row) {
        // Autenticação bem-sucedida
        // Salve o nome do usuário na sessão
        req.session.nomeUsuario = row.nomeCompleto;
        req.session.emailUsuario = email; // Salva o email do usuário na sessão
        req.session.userId = row.id; // Salva o ID do usuário na sessão

        // Redirecione o usuário para a página do candidato
        res.redirect('/candidato-pagina-inicial');
      } else {
        // Credenciais inválidas
        // Redirecione o usuário de volta para a página de login com uma mensagem de erro
        res.redirect('/login?erro=credenciais-invalidas');
      }
    });
  }
});

// 2. Atualize a rota para processar o envio da candidatura
app.get('/vagas-disponiveis', (req, res) => {
  db.all('SELECT * FROM vagas', (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Erro ao buscar vagas.');
    }

    res.render('vagas-disponiveis', { vagas: rows });
  });
});

app.post('/vagas-disponiveis/:id', (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(403).redirect('/login');
  }

  const vagaId = req.params.id;

  db.get('SELECT * FROM candidaturas WHERE user_id = ? AND vaga_id = ?', [userId, vagaId], (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    if (row) {
      // Se o usuário já se candidatou, exiba um alerta e redirecione para a página "vagas-disponiveis"
      return res.send('<script>alert("Você já se candidatou a esta vaga."); window.location.href = "/vagas-disponiveis";</script>');
    }

    db.run(
      'INSERT INTO candidaturas (user_id, vaga_id) VALUES (?, ?)',
      [userId, vagaId],
      function (err) {
        if (err) {
          return console.error(err.message);
        }
        '<script>alert("Candidatura registrada com sucesso."); window.history.back();</script>'
        console.log(`Candidatura registrada com sucesso, ID: ${this.lastID}`);

        // Exiba um alerta de sucesso e redirecione para a página "vagas-disponiveis"
        return res.send('<script>alert("Candidatura registrada com sucesso."); window.location.href = "/vagas-disponiveis";</script>');
      }
    );
  });
});


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});