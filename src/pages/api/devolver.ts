import fs from 'fs'
import path from 'path'

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
  const { emprestimoId, livrosIds } = req.body

  // verifica se os campos foram enviados
  if (!emprestimoId || !livrosIds) {
    return res.status(400).json({ mensagem: 'emprestimoId e livrosIds são obrigatórios.' })
  }

  if (!Array.isArray(livrosIds) || livrosIds.length === 0) {
    return res.status(400).json({ mensagem: 'livrosIds deve ser um array não vazio.' })
  }

  // localiza o empréstimo pelo id
  const emprestimo = parsed.emprestimos.find((e) => e.id === emprestimoId)
  if (!emprestimo) {
    return res.status(404).json({ mensagem: 'Empréstimo não encontrado.' })
  }

  // verifica se o empréstimo ainda está ativo
  if (emprestimo.status !== 'ativo') {
    return res.status(400).json({ mensagem: 'Este empréstimo já foi concluído.' })
  }

  // verifica se os livros pertencem a esse empréstimo
  for (const livroId of livrosIds) {
    if (!emprestimo.livrosIds.includes(livroId)) {
      return res.status(400).json({ mensagem: `Livro com id "${livroId}" não pertence a este empréstimo.` })
    }
  }

  // decrementa qtdEmprestados de cada livro devolvido
  parsed.livros = parsed.livros.map((livro) => {
    if (livrosIds.includes(livro.id)) {
      return { ...livro, qtdEmprestados: Math.max(0, livro.qtdEmprestados - 1) }
    }
    return livro
  })

  // verifica se todos os livros do empréstimo foram devolvidos
  const todosDevolvidos = emprestimo.livrosIds.every((id) => livrosIds.includes(id))

  // atualiza o status do empréstimo
  parsed.emprestimos = parsed.emprestimos.map((e) => {
    if (e.id === emprestimoId) {
      return {
        ...e,
        status: todosDevolvidos ? 'concluído' : 'ativo',
        dataDevolucao: todosDevolvidos ? new Date().toISOString().split('T')[0] : undefined,
        livrosIds: e.livrosIds.filter((id) => !livrosIds.includes(id))
      }
    }
    return e
  })

  // salva tudo de volta no bd.json
  fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2))

  return res.status(200).json({
    mensagem: todosDevolvidos ? 'Devolução concluída com sucesso!' : 'Livros devolvidos parcialmente.'
  })
}