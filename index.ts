import fastify from 'fastify';
import cors from '@fastify/cors';
import mysql from 'mysql2/promise';

const app = fastify();

app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "PaginaDoces",
  port: 3306
};

// Função de tratamento de erros MySQL
function tratarErroMySQL(erro: any, reply: any) {
  if (erro.code === 'ECONNREFUSED') {
    reply.status(400).send({ mensagem: "Conexão recusada. Ligue o MySQL." });
  } else if (erro.code === 'ER_BAD_DB_ERROR') {
    reply.status(400).send({ mensagem: "Banco de dados não encontrado." });
  } else if (erro.code === 'ER_NO_SUCH_TABLE') {
    reply.status(400).send({ mensagem: "Tabela não encontrada. Crie a tabela no MySQL." });
  } else {
    console.error("Erro desconhecido:", erro);
    reply.status(500).send({ mensagem: "Erro interno do servidor." });
  }
}

// ==================== RAIZ ====================
app.get('/', async (request, reply) => {
  reply.send("🍭 API DOCES funcionando!");
});

// ==================== DOCES ====================
app.get('/doces', async (request, reply) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [dados] = await conn.query("SELECT * FROM doces");
    conn.end();
    reply.status(200).send(dados);
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});

app.post('/doces', async (request, reply) => {
  try {
    const { nome, tipo, preco, quantidade } = request.body as any;
    if (!nome || !tipo || preco == null || quantidade == null) {
      return reply.status(400).send({ mensagem: "Campos obrigatórios ausentes." });
    }
    const conn = await mysql.createConnection(dbConfig);
    await conn.query(
      "INSERT INTO doces (nome, tipo, preco, quantidade) VALUES (?, ?, ?, ?)",
      [nome, tipo, preco, quantidade]
    );
    conn.end();
    reply.status(201).send({ mensagem: "Doce cadastrado com sucesso!" });
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});

app.delete('/doces/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.query("DELETE FROM doces WHERE id = ?", [id]);
    conn.end();
    reply.status(200).send({ mensagem: "Doce excluído com sucesso!" });
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});
app.put('/doces/:id/estoque', async (req, reply) => {
  const { id } = req.params as { id: string };
  const { quantidade } = req.body as { quantidade: number };

  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.query(
      "UPDATE doces SET quantidade = ? WHERE id = ?",
      [quantidade, id]
    );
    conn.end();
    reply.send({ mensagem: "Estoque atualizado com sucesso!" });
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});


// ==================== CLIENTES ====================
app.get('/clientes', async (_, reply) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.query("SELECT * FROM clientes");
    conn.end();
    reply.send(rows);
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});

app.post('/clientes', async (req, reply) => {
  const { nome, telefone, endereco, cpf } = req.body as any;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.query(
      "INSERT INTO clientes (nome, telefone, endereco, cpf) VALUES (?, ?, ?, ?)",
      [nome, telefone, endereco, cpf]
    );
    conn.end();
    reply.send({ mensagem: "Cliente cadastrado com sucesso!", id: (result as any).insertId });
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});

app.put('/clientes/:id', async (req, reply) => {
  const { id } = req.params as any;
  const { nome, telefone, endereco, cpf } = req.body as any;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.query(
      "UPDATE clientes SET nome = ?, telefone = ?, endereco = ?, cpf = ? WHERE id = ?",
      [nome, telefone, endereco, cpf, id]
    );
    conn.end();
    reply.send({ mensagem: "Cliente atualizado com sucesso!" });
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});

app.delete('/clientes/:id', async (req, reply) => {
  const { id } = req.params as any;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.query("DELETE FROM clientes WHERE id = ?", [id]);
    conn.end();
    reply.send({ mensagem: "Cliente excluído com sucesso!" });
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});

// ==================== PEDIDOS ====================
app.get('/pedidos', async (_, reply) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.query("SELECT * FROM pedidos");
    conn.end();
    reply.send(rows);
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});

app.post('/pedidos', async (req, reply) => {
  const { cliente, doce, quantidade } = req.body as any;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.query(
      "INSERT INTO pedidos (cliente, doce, quantidade, data_pedido) VALUES (?, ?, ?, NOW())",
      [cliente, doce, quantidade]
    );
    conn.end();
    reply.send({ mensagem: "Pedido cadastrado com sucesso!", id: (result as any).insertId });
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});

app.put('/pedidos/:id', async (req, reply) => {
  const { id } = req.params as any;
  const { cliente, doce, quantidade } = req.body as any;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.query(
      "UPDATE pedidos SET cliente = ?, doce = ?, quantidade = ? WHERE id = ?",
      [cliente, doce, quantidade, id]
    );
    conn.end();
    reply.send({ mensagem: "Pedido atualizado com sucesso!" });
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});

app.delete('/pedidos/:id', async (req, reply) => {
  const { id } = req.params as any;
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.query("DELETE FROM pedidos WHERE id = ?", [id]);
    conn.end();
    reply.send({ mensagem: "Pedido excluído com sucesso!" });
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});

// ==================== START ====================
app.listen({ port: 8000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Servidor rodando em ${address}`);
});