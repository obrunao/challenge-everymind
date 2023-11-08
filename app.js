const { check, validationResult } = require('express-validator');
const express = require('express');
const session = require('express-session');

const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const { log } = require('console');
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
  const nomeUsuario = req.session.nomeUsuario; // Obtenha o nome do usuário da sessão
  res.render('candidato-pagina-inicial', { nomeUsuario });
});




app.get('/entrevistas', (req, res) => {
  res.sendFile('entrevistas.html', { root: path.join(__dirname, 'views') });
});


app.get('/perfil', (req, res) => {
  const userId = req.session.userId; // Suponhamos que você armazene o ID do usuário na sessão
  // Conecte-se ao banco de dados e busque os dados do usuário com base no userId
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      return res.status(500).send('Erro ao buscar dados do usuário.');
    }
    
    if (!row) {
      return res.status(404).send('Usuário não encontrado.');
    }
    
    const { nomeCompleto, telefone, cpf, localizacao, vulnerabilidade, email } = row;
    
    res.render('perfil', { nomeCompleto, telefone, cpf, localizacao, vulnerabilidade, email });
  });
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

  // Transforme a lista de vulnerabilidades em uma string separada por vírgulas
  const vulnerabilidadesString = vulnerabilidades.join(', ');

  // Inserir os dados da vaga no banco de dados SQLite
  db.run(
    'INSERT INTO vagas (titulo, descricao, salario, vulnerabilidade, tipo_trabalho, localizacao) VALUES (?, ?, ?, ?, ?, ?)',
    [titulo, descricao, salario, vulnerabilidadesString, tipo_trabalho, localizacao],
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

          // Agora, recupere todos os e-mails de usuários da base de dados
          db.all('SELECT email FROM users', [], function (err, rows) {
            if (err) {
              return console.error(err.message);
            }
            
            // Envie o e-mail de notificação para cada endereço de e-mail
            for (const row of rows) {
              const userEmail = row.email;
              sendNotificationEmail(userEmail, titulo, descricao, salario, vulnerabilidadesString, tipo_trabalho, localizacao);
            }
          });

          res.redirect('/vagas-cadastradas');
        }
      );
    }
  );
});

function sendNotificationEmail(userEmail, titulo, descricao, salario, vulnerabilidades, tipo_trabalho, localizacao) {
  const nodemailer = require('nodemailer');

  // Configure o transporte de e-mail
  const transporter = nodemailer.createTransport({
    service: 'outlook', // Ou outro serviço de e-mail
    auth: {
      user: 'EverymindRecruiters@hotmail.com', // Seu e-mail
      pass: 'Everymind2023' 
    }
  });

  
  const mailOptions = {
    from: 'EverymindRecruiters@hotmail.com',
    to: userEmail, // Use o endereço de e-mail do usuário como destinatário
    subject: 'Nova Vaga Disponivel!! 😱😱',
    text: `Uma nova vaga foi esta disponivel e pode te interessar.

    Título: ${titulo}
    Descrição: ${descricao}
    Salário: ${salario}
    Vulnerabilidades: ${vulnerabilidades}
    Tipo de Trabalho: ${tipo_trabalho}
    Localização: ${localizacao}`
  };

  // Envie o e-mail de notificação
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Notificação de nova vaga enviada: ' + info.response);
    }
  });
  
}




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
  const nomeUsuario = req.session.nomeUsuario;
  db.all('SELECT * FROM vagas', (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Erro ao buscar vagas.');
    }

    res.render('vagas-disponiveis', { vagas: rows, nomeUsuario }); // Renderiza a página EJS com os dados das vagas
  });
});

app.get('/styles/vagas-cadastradas.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('vagas-cadastradas.css', { root: path.join(__dirname, 'styles') });
});



app.get('/dashboard-candidato', (req, res) => {
  res.sendFile('dashboard-candidato.html', { root: path.join(__dirname, 'views') });
});


app.get('/dashboard-empresa', (req, res) => {
  // Consulta SQL para contar o número de usuários cadastrados
  const queryUsuarios = 'SELECT COUNT(*) AS totalUsuarios FROM users';

  // Consulta SQL para contar o número de vagas cadastradas
  const queryVagas = 'SELECT COUNT(*) AS totalVagas FROM vagas';

  // Consulta SQL para obter as top 5 localidades mais comuns
  const queryTopLocalidades = `
    SELECT localizacao, COUNT(localizacao) AS total
    FROM vagas
    GROUP BY localizacao
    ORDER BY total DESC
    LIMIT 5
  `;

  // Consulta SQL para obter as top 5 vulnerabilidades mais comuns
  const queryTopVulnerabilidades = `
    SELECT vulnerabilidade, COUNT(vulnerabilidade) AS total
    FROM vagas
    GROUP BY vulnerabilidade
    ORDER BY total DESC
    LIMIT 5
  `;

  db.get(queryUsuarios, (errUsuarios, rowUsuarios) => {
    if (errUsuarios) {
      console.error(errUsuarios.message);
      return res.status(500).send('Erro ao buscar o número de usuários.');
    }

    const totalUsuarios = rowUsuarios.totalUsuarios;

    db.get(queryVagas, (errVagas, rowVagas) => {
      if (errVagas) {
        console.error(errVagas.message);
        return res.status(500).send('Erro ao buscar o número de vagas.');
      }

      const totalVagas = rowVagas.totalVagas;

      // Consultar as top 5 localidades
      db.all(queryTopLocalidades, (errLocalidades, rowsLocalidades) => {
        if (errLocalidades) {
          console.error(errLocalidades.message);
          return res.status(500).send('Erro ao buscar as top 5 localidades.');
        }

        // Consultar as top 5 vulnerabilidades
        db.all(queryTopVulnerabilidades, (errVulnerabilidades, rowsVulnerabilidades) => {
          if (errVulnerabilidades) {
            console.error(errVulnerabilidades.message);
            return res.status(500).send('Erro ao buscar as top 5 vulnerabilidades.');
          }

          // Renderizar a página dashboard-empresa.ejs com os dados coletados
          res.render('dashboard-empresa', {
            totalUsuarios,
            totalVagas,
            topLocalidades: rowsLocalidades,
            topVulnerabilidades: rowsVulnerabilidades,
          });
        });
      });
    });
  });
});



db.serialize(() => {
  db.run(`
  CREATE TABLE IF NOT EXISTS candidaturas (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    vaga_id INTEGER,
    estado TEXT,
    status_teste TEXT DEFAULT "Pendente" NOT NULL,
    status_entrevista TEXT DEFAULT "Não Confirmado" NOT NULL,
    status_feedback TEXT DEFAULT "Não Enviado" NOT NULL,
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
  const nomeUsuario = req.session.nomeUsuario;
  db.all('SELECT * FROM vagas', (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Erro ao buscar vagas.');
    }

    res.render('vagas-disponiveis', { vagas: rows, nomeUsuario });
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
  const nomeUsuario = req.session.nomeUsuario;
  // Primeiro, obtenha o ID do usuário da sessão
  const userId = req.session.userId;

  if (!userId) {
    return res.status(403).redirect('/login');
  }

  // Consulte o banco de dados para recuperar as vagas às quais o usuário se candidatou
  db.all('SELECT v.*, c.estado FROM vagas v JOIN candidaturas c ON v.id = c.vaga_id WHERE c.user_id = ?', [userId], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Erro ao buscar vagas.');
    }

    res.render('minhas-vagas', { vagas: rows, nomeUsuario });
  });
});


app.get('/candidatos-vagas', (req, res) => {
  // Consulte o banco de dados para recuperar informações de todas as vagas candidatas, incluindo o ID da vaga, a data da entrevista e o status_teste
  db.all('SELECT v.id AS vagaId, v.titulo, u.nomeCompleto, u.localizacao, u.vulnerabilidade, c.estado, c.data_entrevista,c.status_teste, c.status_entrevista, c.status_feedback ,v.tipo_trabalho ,u.id AS userId, c.status_teste FROM vagas v JOIN candidaturas c ON v.id = c.vaga_id JOIN users u ON u.id = c.user_id', (err, rows) => {
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

  console.log(candidaturaId);
  console.log(vagaId);
  console.log(feedbackText);

  if (!candidaturaId || !vagaId) {
    res.status(400).send('Parâmetros inválidos');
    return;
  }


  db.run('UPDATE candidaturas SET status_feedback = "Enviado" WHERE user_id = ? AND vaga_id = ?', [candidaturaId, vagaId], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao inserir o status de feedback.');
    } else {
      console.log(`Status "Enviado" inserido na tabela status_feedback para a candidatura com ID ${candidaturaId}, vaga com ID ${vagaId}.`);
    }
  });

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


app.get('/testes-candidato', (req, res) => {

  const nomeUsuario = req.session.nomeUsuario;
  // Primeiro, obtenha o ID do usuário da sessão
  const userId = req.session.userId;

  if (!userId) {
    return res.status(403).redirect('/login');
  }

  db.all('SELECT v.*, c.estado, c.user_id AS candidaturaId, c.status_teste FROM vagas v JOIN candidaturas c ON v.id = c.vaga_id WHERE c.user_id = ?', [userId], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Erro ao buscar vagas.');
    }

    res.render('testes-candidato', { vagas: rows, nomeUsuario });
  });
});


app.post('/realizar-teste/:candidaturaId/:vagaId', (req, res) => {
  const vagaId = req.params.candidaturaId;
  const candidaturaId = req.params.vagaId;
  const statusTeste = "Realizado";

  db.run('UPDATE candidaturas SET status_teste = ? WHERE user_id = ? AND vaga_id = ?', [statusTeste, candidaturaId, vagaId], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao marcar como Realizado.');
    } else {
      console.log(`Teste realizado com sucesso, ID do user: ${candidaturaId}, ID da vaga: ${vagaId}`);
      res.status(200).send('Teste realizado com sucesso.');

    }
  });
});


app.get('/entrevista-candidato', (req, res) => {
  // Primeiro, obtenha o ID do usuário da sessão
  const nomeUsuario = req.session.nomeUsuario;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(403).redirect('/login');
  }

  db.all('SELECT v.*, c.estado, c.user_id AS candidaturaId, c.status_teste, c.data_entrevista, c.status_entrevista FROM vagas v JOIN candidaturas c ON v.id = c.vaga_id WHERE c.user_id = ?', [userId], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Erro ao buscar vagas.');
    }

    res.render('entrevista-candidato', { vagas: rows, nomeUsuario });
  });
});


app.post('/confirmar-entrevista/:candidaturaId/:vagaId', (req, res) => {
  const vagaId = req.params.candidaturaId;
  const candidaturaId = req.params.vagaId;
  const statusEntrevista = "Confirmado";

  db.run('UPDATE candidaturas SET status_entrevista = ? WHERE user_id = ? AND vaga_id = ?', [statusEntrevista, candidaturaId, vagaId], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Erro ao confirmar entrevista.');
    } else {
      console.log(`Entrevista confirmada com sucesso, ID do user: ${candidaturaId}, ID da vaga: ${vagaId}`);
      res.status(200).send('Entrevista confirmada com sucesso.');

    }
  });
});

app.get('/feedback-candidato', (req, res) => {
  const nomeUsuario = req.session.nomeUsuario;

  const userId = req.session.userId;

  if (!userId) {
    return res.status(403).redirect('/login');
  }

  db.all('SELECT v.*, c.estado, c.user_id AS candidaturaId, c.status_teste, c.data_entrevista, c.feedback, c.status_feedback FROM vagas v JOIN candidaturas c ON v.id = c.vaga_id WHERE c.user_id = ?', [userId], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Erro ao buscar vagas.');
    }

    res.render('feedback-candidato', { vagas: rows, nomeUsuario });
  });
});

app.get('/styles/perfil.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile('perfil.css', { root: path.join(__dirname, 'styles') });
});


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});