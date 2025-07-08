import fastify from 'fastify';
import cors from '@fastify/cors';
import mysql from 'mysql2/promise';

const app = fastify();
app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'DELETE']
});
;

const config = {
  host: "localhost",
  user: "root",
  password: "",
  database: "PaginaDoces",
  port: 3306
};


app.get('/', async (request, reply) => {
  reply.send("🍭 API DOCES funcionando!");
});

app.get('/doces', async (request, reply) => {
  try {
    const conn = await mysql.createConnection(config);
    const [dados] = await conn.query("SELECT * FROM doces");
    reply.status(200).send(dados);
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});


app.delete('/doces/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  console.log("Recebendo pedido para deletar doce com ID:", id); // <- AJUDA!

  try {
    const conn = await mysql.createConnection(config);
    await conn.query("DELETE FROM doces WHERE id = ?", [id]);
    reply.status(200).send({ mensagem: "Doce excluído com sucesso!" });
  } catch (erro) {
    tratarErroMySQL(erro, reply);
  }
});

app.post('/doces', async (request, reply) => {
  try {
    const { nome, tipo, preco, quantidade } = request.body as {
      nome: string;
      tipo: string;
      preco: number;
      quantidade: number;
    };

    if (!nome || !tipo || preco == null || quantidade == null) {
      return reply.status(400).send({ mensagem: "Campos obrigatórios ausentes." });
    }

    const conn = await mysql.createConnection(config);
    await conn.query(
      "INSERT INTO doces (nome, tipo, preco, quantidade) VALUES (?, ?, ?, ?)",
      [nome, tipo, preco, quantidade]
    );

    reply.status(201).send({ mensagem: "Doce cadastrado com sucesso!" });
  } catch (erro: any) {
    tratarErroMySQL(erro, reply);
  }
});







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



app.listen({ port: 8000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`)
})