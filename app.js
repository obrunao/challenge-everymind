const { check, validationResult } = require('express-validator');
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

app.get('/pagina-inicial', (req, res) => {
  res.sendFile('pagina-inicial.html', { root: path.join(__dirname, 'views') });
});

app.get('/styles/bootstrap.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('bootstrap.css', { root: path.join(__dirname, 'styles') });
});

app.get('/styles/fontawesome-all.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('fontawesome-all.css', { root: path.join(__dirname, 'styles') });
});

app.get('/styles/swiper.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('swiper.css', { root: path.join(__dirname, 'styles') });
});

app.get('/styles/magnific-popup.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('magnific-popup.css', { root: path.join(__dirname, 'styles') });
});


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

app.get('/styles/candidatos-vagas.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('candidatos-vagas.css', { root: path.join(__dirname, 'styles') });
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
  const vulnerabilidades = req.body.vulnerabilidades; // Agora, vulnerabilidades é um array
  const email = req.body.email;
  const senha = req.body.senha;
  const localizacao = req.body.localizacao;

  // Inserir os dados no banco de dados SQLite
  db.run(
    'INSERT INTO users (nomeCompleto, telefone, cpf, vulnerabilidade, email, senha, localizacao) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [nomeCompleto, telefone, cpf, vulnerabilidades, email, senha, localizacao],
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
  const erro = req.query.erro;
  res.render('login', { erro })
  //res.sendFile('login.html', { root: path.join(__dirname, 'views') });
});
app.get('/styles/login.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('login.css', { root: path.join(__dirname, 'styles') });
});

app.get('/styles/styles.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('styles.css', { root: path.join(__dirname, 'styles') });
});


app.post('/login', (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;
  let erro = null; // Inicialize a variável de erro como nula

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
        erro = 'Credenciais inválidas'; // Defina a variável de erro
        res.render('login', { erro }); // Passe a variável de erro para a página de login
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
  const vulnerabilidades = req.body.vulnerabilidade; // Renomeado para 'vulnerabilidades'
  const tipo_trabalho = req.body.tipo_trabalho;
  const localizacao = req.body.localizacao;
  const competencias = req.body.competencias;

  // Transforme a lista de vulnerabilidades em uma string separada por vírgulas
  const vulnerabilidadesString = vulnerabilidades.join(', ');

  // Inserir os dados da vaga no banco de dados SQLite
  db.run(
    'INSERT INTO vagas (titulo, descricao, salario, vulnerabilidade, tipo_trabalho, localizacao, competencias) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [titulo, descricao, salario, vulnerabilidadesString, tipo_trabalho, localizacao, competencias],
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




app.get('/testes-candidato', (req, res) => {
  res.sendFile('testes-candidato.html', { root: path.join(__dirname, 'views') });
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
      estado TEXT,
      data_entrevista DATE,
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
      'INSERT INTO candidaturas (user_id, vaga_id, estado) VALUES (?, ?, "Nenhuma")',
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

app.get('/minhas-vagas', (req, res) => {
  // Primeiro, obtenha o ID do usuário da sessão
  const userId = req.session.userId;

  if (!userId) {
    return res.status(403).redirect('/login');
  }

  // Consulte o banco de dados para recuperar as vagas às quais o usuário se candidatou
  db.all('SELECT v.* FROM vagas v JOIN candidaturas c ON v.id = c.vaga_id WHERE c.user_id = ?', [userId], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Erro ao buscar vagas.');
    }

    res.render('minhas-vagas', { vagas: rows });
  });
});


app.get('/candidatos-vagas', (req, res) => {
  // Consulte o banco de dados para recuperar informações de todas as vagas candidatas, incluindo o ID da vaga e a data da entrevista
  db.all('SELECT v.id AS vagaId, v.titulo, u.nomeCompleto, u.localizacao, u.vulnerabilidade, c.estado, c.data_entrevista, u.id AS userId FROM vagas v JOIN candidaturas c ON v.id = c.vaga_id JOIN users u ON u.id = c.user_id', (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Erro ao buscar informações de candidaturas.');
    }

    res.render('candidatos-vagas', { candidaturas: rows, nomeUsuario: req.session.nomeUsuario });
  });
});

app.post('/avancar-fase/:candidaturaId/:vagaId', (req, res) => {
  const candidaturaId = req.params.candidaturaId;
  const vagaId = req.params.vagaId;

  const sql = 'UPDATE candidaturas SET estado = ? WHERE user_id = ? AND vaga_id = ?';
  const fases = ['Teste', 'Entrevista', 'Feedback']; // Defina as fases na ordem desejada

  db.get('SELECT estado FROM candidaturas WHERE user_id = ? AND vaga_id = ?', [candidaturaId, vagaId], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao avançar para a próxima fase.');
    } else if (row && row.estado !== fases[fases.length - 1]) {
      // Verifique se a fase atual não é a última fase
      const faseIndex = fases.indexOf(row.estado);
      const próximaFase = fases[faseIndex + 1];

      db.run(sql, [próximaFase, candidaturaId, vagaId], (err) => {
        if (err) {
          console.error(err.message);
          res.status(500).send('Erro ao avançar para a próxima fase.');
        } else {
          console.log(`Candidato com ID ${candidaturaId} avançou para a fase: ${próximaFase}`);
          res.status(200).send(`Candidato avançou para a fase: ${próximaFase}`);
        }
      });
    } else {
      // A candidatura está na última fase, não é possível avançar mais.
      res.status(400).send('A candidatura já está na última fase.');
    }
  });
});




app.post('/excluir-candidato/:candidaturaId/:vagaId', (req, res) => {
  const candidaturaId = req.params.candidaturaId; // Obtém o ID da candidatura a ser excluída
  const vagaId = req.params.vagaId; // Obtém o ID da vaga associada à candidatura

  console.log(`ID da candidatura a ser excluída: ${candidaturaId}`);
  console.log(`ID da vaga associada à candidatura: ${vagaId}`);

  // Implemente a lógica para verificar se a candidatura com o candidaturaId está associada à vaga com o vagaId
  // Você deve executar uma consulta SQL para verificar a associação.

  const sql = 'SELECT user_id FROM candidaturas WHERE user_id = ? AND vaga_id = ?';

  db.get(sql, [candidaturaId, vagaId], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao verificar a associação da candidatura.');
    } else if (row) {
      // A associação entre candidaturaId e vagaId foi encontrada, agora você pode excluir o candidato
      db.run('DELETE FROM candidaturas WHERE user_id = ? AND vaga_id = ?', [candidaturaId, vagaId], (err) => {
        if (err) {
          console.error(err.message);
          res.status(500).send('Erro ao excluir o candidato.');
        } else {
          console.log(`Candidato com ID ${candidaturaId} associado à vaga com ID ${vagaId} excluído com sucesso.`);
          res.status(200).send('Candidato excluído com sucesso.');
        }
      });
    } else {
      // A associação não foi encontrada, o que significa que o candidato não está associado à vaga especificada
      res.status(400).send('A candidatura não está associada à vaga especificada.');
    }
  });
});



app.post('/agendar-entrevista/:candidaturaId/:vagaId', (req, res) => {
  const candidaturaId = req.params.candidaturaId;
  const dataEntrevista = req.body.dataEntrevista;
  const vagaId = req.params.vagaId;

  if (!candidaturaId || !vagaId) {
    res.status(400).send('Parâmetros inválidos');
    return;
  }
  console.log(candidaturaId);
  console.log(vagaId);
  console.log(dataEntrevista);


  db.run('UPDATE candidaturas SET data_entrevista = ? WHERE user_id = ? AND vaga_id = ?', [dataEntrevista, candidaturaId, vagaId], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao inserir Data.');
    } else {
      console.log(`Entrevista marcada para ${dataEntrevista} associado à vaga com ID ${vagaId} e usuario ${candidaturaId}.`);
      res.status(200).send('Candidato agendado com sucesso.');
    }
  });

});



app.post('/enviar-feedback/:candidaturaId/:vagaId', (req, res) => {
  const candidaturaId = req.params.candidaturaId;
  const vagaId = req.params.vagaId;
  const feedbackText = req.body.feedbackText;

console.log(candidaturaId)
console.log(vagaId)
console.log(feedbackText)

  if (!candidaturaId || !vagaId) {
      res.status(400).send('Parâmetros inválidos');
      return;
  }

  // Atualize a coluna "feedback" na tabela "candidaturas"
  db.run('UPDATE candidaturas SET feedback = ? WHERE user_id = ? AND vaga_id = ?', [feedbackText, candidaturaId, vagaId], (err) => {
      if (err) {
          console.error(err.message);
          res.status(500).send('Erro ao salvar o feedback.');
      } else {
          console.log(`Feedback salvo para a candidatura com ID ${candidaturaId}, vaga com ID ${vagaId}.`);
          res.status(200).send('Feedback salvo com sucesso.');
      }
  });
});



app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});