import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// localiza o arquivo bd.json
const filePath = path.join(process.cwd(), 'src', 'pages', 'api', 'bd.json')

export default function handler(req, res) {
  // só aceita requisição do tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ mensagem: 'Método não permitido.' })
  }

  // lê o banco de dados
  const jsonData = fs.readFileSync(filePath, 'utf-8')
  const parsed = JSON.parse(jsonData)

  // pega os dados enviados pelo front
  const { usuarioId, livrosIds, dataEmprestimo } = req.body

  // verifica se todos os campos foram enviados
  if (!usuarioId || !livrosIds || !dataEmprestimo) {
    return res.status(400).json({ mensagem: 'usuarioId, livrosIds e dataEmprestimo são obrigatórios.' })
  }

  // verifica se livrosIds é uma lista com pelo menos 1 item
  if (!Array.isArray(livrosIds) || livrosIds.length === 0) {
    return res.status(400).json({ mensagem: 'livrosIds deve ser um array não vazio.' })
  }

  // verifica se o usuário existe no banco
  const usuario = parsed.usuarios.find((u) => u.id === usuarioId)
  if (!usuario) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado.' })
  }

  // verifica se cada livro existe e tem unidades disponíveis
  for (const livroId of livrosIds) {
    const livro = parsed.livros.find((l) => l.id === livroId)
    if (!livro) {
      return res.status(404).json({ mensagem: `Livro com id "${livroId}" não encontrado.` })
    }
    if (livro.quantidade <= livro.qtdEmprestados) {
      return res.status(400).json({ mensagem: `Livro "${livro.titulo}" não possui unidades disponíveis.` })
    }
  }

  // incrementa qtdEmprestados de cada livro emprestado
  parsed.livros = parsed.livros.map((livro) => {
    if (livrosIds.includes(livro.id)) {
      return { ...livro, qtdEmprestados: livro.qtdEmprestados + 1 }
    }
    return livro
  })

  // cria o registro do empréstimo
  const novoEmprestimo = {
    id: uuidv4(),
    usuarioId,
    livrosIds,
    dataEmprestimo,
    status: 'ativo'
  }

  parsed.emprestimos.push(novoEmprestimo)

  // salva tudo de volta no bd.json
  fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2))

  return res.status(201).json({ mensagem: 'Empréstimo realizado com sucesso!', emprestimo: novoEmprestimo })
}