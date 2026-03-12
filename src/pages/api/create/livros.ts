import fs from 'fs';
import path from 'path';

// Caminho absoluto para o arquivo de dados
const filePath = path.join(process.cwd(), 'src', 'pages', 'api', 'bd.json');

export default function handler(req, res) {
    type Livro = {
        nomeLivro: string;
        [key: string]: unknown;
    };

    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(jsonData) as { livros?: Livro[] };
    const livros = parsed.livros ?? [];

    const { nomeLivro, ...dadosLivro } = req.body as {
        nomeLivro: string;
        [key: string]: unknown;
    };

    if (!nomeLivro || typeof nomeLivro !== 'string') {
        return res.status(400).json({ mensagem: 'Nome do livro é obrigatório.' });
    }

    const jaExiste = livros.some(
        (livro: Livro) =>
            livro.nomeLivro.trim().toLowerCase() === nomeLivro.trim().toLowerCase()
    );

    if (jaExiste) {
        return res.status(400).json({ mensagem: 'Livro já cadastrado!' });
    }

    livros.push({ nomeLivro: nomeLivro.trim(), ...dadosLivro });
    fs.writeFileSync(filePath, JSON.stringify({ livros }, null, 2));

    res.status(200).json({ mensagem: 'Livro cadastrado com sucesso!' });
}