import fs from 'fs';
import path from 'path';

// Caminho absoluto para o arquivo de dados
const filePath = path.join(process.cwd(), 'src', 'pages', 'api', 'bd.json');

export default function handler(req, res) {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const { usuarios } = JSON.parse(jsonData);

    const { nome, email, telefone } = req.body

    // verificar se o nome existe no array prévio
    if (usuarios.some((user) => user.nome === nome)) {
        return res.status(400).json({ mensagem: 'Usuário já cadastrado !' });
    }

    usuarios.push({ nome, email, telefone });
    fs.writeFileSync(filePath, JSON.stringify({ usuarios }));

    res.status(200).json({ mensagem: 'Usuário cadastrado com sucesso !' });
}