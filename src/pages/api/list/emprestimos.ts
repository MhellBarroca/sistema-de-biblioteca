import fs from 'fs'
import path from 'path'

// localiza o arquivo bd.json
const filePath = path.join(process.cwd(), 'src', 'pages', 'api', 'bd.json')

export default function handler(req, res) {
  // lê o banco de dados
  const jsonData = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(jsonData)

  // enriquece cada empréstimo com os dados do usuário e dos livros
  const emprestimosCompletos = data.emprestimos.map((emp) => {
    const usuario = data.usuarios.find((u) => u.id === emp.usuarioId)
    const livros = emp.livrosIds.map((id) => data.livros.find((l) => l.id === id)).filter(Boolean)
    return { ...emp, usuario, livros }
  })

  res.status(200).json({ emprestimos: emprestimosCompletos })
}