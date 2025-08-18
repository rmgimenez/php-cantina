const mysql = require("mysql2/promise");

async function seedAlunosData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "sant31br",
  });

  try {
    console.log("🔍 Verificando se existem alunos...");

    // Verificar se já existem alunos
    const [alunosRows] = await connection.execute(
      "SELECT COUNT(*) as total FROM cadastro_alunos"
    );
    const totalAlunos = alunosRows[0].total;

    if (totalAlunos === 0) {
      console.log("⚠️ Nenhum aluno encontrado na tabela cadastro_alunos");
      console.log("💡 Este script cria dados de exemplo para testes");

      // Inserir alguns alunos de exemplo
      console.log("📝 Inserindo alunos de exemplo...");

      const alunosExemplo = [
        {
          ra: 12345,
          nome: "João Silva Santos",
          nome_social: null,
          nasc: "2010-03-15",
          curso_nome: "Ensino Fundamental",
          serie: 8,
          turma: "A",
          periodo: "Matutino",
          status: "MAT",
          nome_resp: "Maria Silva Santos",
          cpf_resp: "123.456.789-00",
          nasc_resp: "1985-06-20",
          tel_cel_resp: "(11) 99999-1234",
          email_resp: "maria.silva@email.com",
        },
        {
          ra: 23456,
          nome: "Ana Carolina Oliveira",
          nome_social: "Ana",
          nasc: "2009-08-22",
          curso_nome: "Ensino Fundamental",
          serie: 9,
          turma: "B",
          periodo: "Matutino",
          status: "MAT",
          nome_resp: "Carlos Oliveira",
          cpf_resp: "987.654.321-00",
          nasc_resp: "1980-12-10",
          tel_cel_resp: "(11) 98888-5678",
          email_resp: "carlos.oliveira@email.com",
        },
        {
          ra: 34567,
          nome: "Pedro Henrique Costa",
          nome_social: null,
          nasc: "2011-01-05",
          curso_nome: "Ensino Fundamental",
          serie: 7,
          turma: "A",
          periodo: "Vespertino",
          status: "MAT",
          nome_resp: "Sandra Costa",
          cpf_resp: "456.789.123-00",
          nasc_resp: "1988-04-18",
          tel_cel_resp: "(11) 97777-9012",
          email_resp: "sandra.costa@email.com",
        },
      ];

      for (const aluno of alunosExemplo) {
        await connection.execute(
          `
          INSERT INTO cadastro_alunos (
            ra, nome, nome_social, nasc, curso_nome, serie, turma, periodo, status,
            nome_resp, cpf_resp, nasc_resp, tel_cel_resp, email_resp, dt_cadastro
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `,
          [
            aluno.ra,
            aluno.nome,
            aluno.nome_social,
            aluno.nasc,
            aluno.curso_nome,
            aluno.serie,
            aluno.turma,
            aluno.periodo,
            aluno.status,
            aluno.nome_resp,
            aluno.cpf_resp,
            aluno.nasc_resp,
            aluno.tel_cel_resp,
            aluno.email_resp,
          ]
        );

        console.log(`✅ Aluno ${aluno.nome} (RA: ${aluno.ra}) inserido`);
      }

      // Verificar se a view 'alunos' existe, se não, criar
      try {
        await connection.execute("SELECT 1 FROM alunos LIMIT 1");
        console.log('✅ View "alunos" encontrada e funcionando');
      } catch (error) {
        console.log('⚠️ View "alunos" não encontrada ou com problema');
        console.log(
          "💡 Verifique se o bancodados.sql foi executado corretamente"
        );
      }
    } else {
      console.log(`✅ Encontrados ${totalAlunos} alunos na base de dados`);
    }

    // Verificar contas de alunos
    console.log("\n🔍 Verificando contas de alunos...");
    const [contasRows] = await connection.execute(
      "SELECT COUNT(*) as total FROM cant_contas_alunos"
    );
    const totalContas = contasRows[0].total;

    console.log(`📊 Contas de alunos existentes: ${totalContas}`);

    if (totalContas === 0 && totalAlunos > 0) {
      console.log(
        "💡 Você pode criar contas para os alunos através da interface web"
      );
      console.log("🌐 Acesse: /alunos para gerenciar contas");
    }

    // Mostrar alguns alunos de exemplo
    console.log("\n📋 Primeiros alunos cadastrados:");
    const [alunosExemplo] = await connection.execute(`
      SELECT ra, nome, nome_social, serie, turma, status 
      FROM cadastro_alunos 
      ORDER BY ra 
      LIMIT 5
    `);

    alunosExemplo.forEach((aluno) => {
      console.log(
        `  - RA: ${aluno.ra} | ${aluno.nome} | ${aluno.serie}ª série - Turma ${aluno.turma} | Status: ${aluno.status}`
      );
    });

    console.log("\n✅ Verificação de dados concluída!");
    console.log(
      '🌐 Acesse a aplicação e vá para a seção "Alunos" para testar as funcionalidades'
    );
  } catch (error) {
    console.error("❌ Erro:", error.message);
  } finally {
    await connection.end();
  }
}

// Executar o script se chamado diretamente
if (require.main === module) {
  seedAlunosData().catch(console.error);
}

module.exports = seedAlunosData;
