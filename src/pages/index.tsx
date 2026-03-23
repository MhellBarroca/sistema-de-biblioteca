import { useState, useEffect, useCallback } from "react"

type Livro = { id: string; titulo: string; autor: string; genero: string; quantidade: number; qtdEmprestados: number }
type Usuario = { id: string; nome: string; email: string; telefone: string }
type Emprestimo = { id: string; usuarioId: string; livrosIds: string[]; dataEmprestimo: string; status: string; usuario?: Usuario; livros?: Livro[] }

// função que faz as chamadas para a API
const api = async (url: string, method = "GET", body?: object) => {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.mensagem || "Erro")
  return data
}

export default function Home() {
  const [aba, setAba] = useState<"livros" | "usuarios" | "emprestimos">("livros")
  const [livros, setLivros] = useState<Livro[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [aviso, setAviso] = useState<{ msg: string; ok: boolean } | null>(null)

  // mostra mensagem de sucesso ou erro por 3 segundos
  const notificar = (msg: string, ok = true) => {
    setAviso({ msg, ok })
    setTimeout(() => setAviso(null), 3500)
  }

  // busca todos os dados da API
  const carregar = useCallback(async () => {
    try {
      const [l, u, e] = await Promise.all([
        api("/api/list/livros"),
        api("/api/list/usuarios"),
        api("/api/list/emprestimos"),
      ])
      setLivros(l.livros)
      setUsuarios(u.usuarios)
      setEmprestimos(e.emprestimos)
    } catch {}
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // estados dos formulários
  const [fLivro, setFLivro] = useState({ titulo: "", autor: "", genero: "", quantidade: "" })
  const [fUsuario, setFUsuario] = useState({ nome: "", email: "", telefone: "" })
  const [fEmp, setFEmp] = useState({ usuarioId: "", livrosIds: [] as string[], dataEmprestimo: new Date().toISOString().split("T")[0] })
  const [fDev, setFDev] = useState({ emprestimoId: "", livrosIds: [] as string[] })

  const salvarLivro = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const r = await api("/api/create/livros", "POST", { ...fLivro, quantidade: Number(fLivro.quantidade) })
      notificar(r.mensagem)
      setFLivro({ titulo: "", autor: "", genero: "", quantidade: "" })
      carregar()
    } catch (err: any) { notificar(err.message, false) }
  }

  const salvarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const r = await api("/api/create/usuarios", "POST", fUsuario)
      notificar(r.mensagem)
      setFUsuario({ nome: "", email: "", telefone: "" })
      carregar()
    } catch (err: any) { notificar(err.message, false) }
  }

  const salvarEmprestimo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const r = await api("/api/emprestar", "POST", fEmp)
      notificar(r.mensagem)
      setFEmp({ usuarioId: "", livrosIds: [], dataEmprestimo: new Date().toISOString().split("T")[0] })
      carregar()
    } catch (err: any) { notificar(err.message, false) }
  }

  const salvarDevolucao = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const r = await api("/api/devolver", "POST", fDev)
      notificar(r.mensagem)
      setFDev({ emprestimoId: "", livrosIds: [] })
      carregar()
    } catch (err: any) { notificar(err.message, false) }
  }

  const marcarLivroEmp = (id: string) =>
    setFEmp(p => ({ ...p, livrosIds: p.livrosIds.includes(id) ? p.livrosIds.filter(x => x !== id) : [...p.livrosIds, id] }))

  const marcarLivroDev = (id: string) =>
    setFDev(p => ({ ...p, livrosIds: p.livrosIds.includes(id) ? p.livrosIds.filter(x => x !== id) : [...p.livrosIds, id] }))

  const empAtivo = emprestimos.find(e => e.id === fDev.emprestimoId)

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f0f4f8; color: #1a202c; }
        .topo { background: #2b4c7e; color: white; padding: 1.5rem 2rem; }
        .topo h1 { font-size: 1.6rem; }
        .topo p { font-size: .9rem; opacity: .8; margin-top: .25rem; }
        .abas { display: flex; background: #1e3a5f; }
        .aba { flex: 1; padding: .9rem; text-align: center; cursor: pointer; color: #a0b4cc; font-weight: bold; border: none; background: none; font-size: .95rem; }
        .aba.ativa { background: #f0f4f8; color: #2b4c7e; }
        .aba:hover:not(.ativa) { background: #2b4c7e; color: white; }
        .conteudo { display: grid; grid-template-columns: 1fr 1.4fr; min-height: calc(100vh - 110px); }
        @media(max-width:700px) { .conteudo { grid-template-columns: 1fr; } }
        .col { padding: 1.5rem; }
        .col-esq { background: #e8eef5; border-right: 1px solid #c8d5e3; }
        .titulo-col { font-size: 1.1rem; font-weight: bold; color: #2b4c7e; margin-bottom: 1.2rem; padding-bottom: .6rem; border-bottom: 2px solid #2b4c7e; }
        .campo { margin-bottom: .9rem; }
        label { display: block; font-size: .78rem; font-weight: bold; text-transform: uppercase; color: #4a6080; margin-bottom: .3rem; }
        input, select { width: 100%; padding: .55rem .8rem; border: 1px solid #b0bec5; border-radius: 4px; font-size: .92rem; background: white; }
        input:focus, select:focus { outline: none; border-color: #2b4c7e; }
        .btn { width: 100%; padding: .7rem; background: #2b4c7e; color: white; border: none; border-radius: 4px; font-size: .95rem; font-weight: bold; cursor: pointer; margin-top: .4rem; }
        .btn:hover { background: #1e3a5f; }
        .btn:disabled { opacity: .5; cursor: not-allowed; }
        .lista { display: flex; flex-direction: column; gap: .7rem; }
        .card { background: white; border: 1px solid #c8d5e3; border-radius: 6px; padding: .9rem 1rem; }
        .card-titulo { font-weight: bold; font-size: 1rem; margin-bottom: .2rem; }
        .card-sub { font-size: .83rem; color: #5a7080; }
        .tag { display: inline-block; padding: .18rem .55rem; border-radius: 12px; font-size: .72rem; font-weight: bold; }
        .tag-verde { background: #e6f4ea; color: #2e7d32; border: 1px solid #a5d6a7; }
        .tag-amarelo { background: #fff8e1; color: #f57f17; border: 1px solid #ffe082; }
        .tag-azul { background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9; }
        .tag-vermelho { background: #fce4ec; color: #c62828; border: 1px solid #f48fb1; }
        .linha { display: flex; justify-content: space-between; align-items: center; }
        .opcao { display: flex; align-items: center; gap: .5rem; padding: .45rem .7rem; border: 1px solid #b0bec5; border-radius: 4px; cursor: pointer; margin-bottom: .4rem; font-size: .88rem; background: white; }
        .opcao.marcado { border-color: #2b4c7e; background: #e3f2fd; }
        .opcao.bloqueado { opacity: .45; cursor: not-allowed; }
        .opcao input[type=checkbox] { width: auto; }
        .divisor { border: none; border-top: 1px solid #b0bec5; margin: 1.2rem 0; }
        .vazio { text-align: center; color: #8090a0; font-style: italic; padding: 2rem; }
        .aviso { position: fixed; bottom: 1.5rem; right: 1.5rem; padding: .8rem 1.2rem; border-radius: 6px; font-weight: bold; font-size: .9rem; z-index: 999; box-shadow: 0 2px 8px rgba(0,0,0,.2); }
        .aviso-ok { background: #2e7d32; color: white; }
        .aviso-err { background: #c62828; color: white; }
      `}</style>

      <div className="topo">
        <h1>📚 Sistema de Biblioteca</h1>
        <p>Gestão de livros, usuários e empréstimos</p>
      </div>

      <div className="abas">
        {(["livros", "usuarios", "emprestimos"] as const).map(a => (
          <button key={a} className={`aba ${aba === a ? "ativa" : ""}`} onClick={() => setAba(a)}>
            {a === "livros" ? "📖 Livros" : a === "usuarios" ? "👤 Usuários" : "🔄 Empréstimos"}
          </button>
        ))}
      </div>

      {/* ABA LIVROS */}
      {aba === "livros" && (
        <div className="conteudo">
          <div className="col col-esq">
            <div className="titulo-col">Cadastrar Livro</div>
            <form onSubmit={salvarLivro}>
              <div className="campo"><label>Título</label><input value={fLivro.titulo} onChange={e => setFLivro({ ...fLivro, titulo: e.target.value })} placeholder="Ex: Dom Casmurro" required /></div>
              <div className="campo"><label>Autor</label><input value={fLivro.autor} onChange={e => setFLivro({ ...fLivro, autor: e.target.value })} placeholder="Ex: Machado de Assis" required /></div>
              <div className="campo"><label>Gênero</label><input value={fLivro.genero} onChange={e => setFLivro({ ...fLivro, genero: e.target.value })} placeholder="Ex: Romance" required /></div>
              <div className="campo"><label>Quantidade</label><input type="number" min="1" value={fLivro.quantidade} onChange={e => setFLivro({ ...fLivro, quantidade: e.target.value })} placeholder="Ex: 5" required /></div>
              <button type="submit" className="btn">Cadastrar Livro</button>
            </form>
          </div>
          <div className="col">
            <div className="titulo-col">Acervo ({livros.length} títulos)</div>
            <div className="lista">
              {livros.length === 0 ? <p className="vazio">Nenhum livro cadastrado.</p> : livros.map(l => {
                const disp = l.quantidade - l.qtdEmprestados
                return (
                  <div className="card" key={l.id}>
                    <div className="linha">
                      <span className="card-titulo">{l.titulo}</span>
                      <span className={`tag ${disp === 0 ? "tag-vermelho" : disp <= 1 ? "tag-amarelo" : "tag-verde"}`}>
                        {disp === 0 ? "Esgotado" : `${disp} disponível${disp !== 1 ? "is" : ""}`}
                      </span>
                    </div>
                    <p className="card-sub">{l.autor} · {l.genero}</p>
                    <p className="card-sub">Total: {l.quantidade} · Emprestados: {l.qtdEmprestados}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ABA USUÁRIOS */}
      {aba === "usuarios" && (
        <div className="conteudo">
          <div className="col col-esq">
            <div className="titulo-col">Cadastrar Usuário</div>
            <form onSubmit={salvarUsuario}>
              <div className="campo"><label>Nome</label><input value={fUsuario.nome} onChange={e => setFUsuario({ ...fUsuario, nome: e.target.value })} placeholder="Nome completo" required /></div>
              <div className="campo"><label>E-mail</label><input type="email" value={fUsuario.email} onChange={e => setFUsuario({ ...fUsuario, email: e.target.value })} placeholder="email@exemplo.com" required /></div>
              <div className="campo"><label>Telefone</label><input value={fUsuario.telefone} onChange={e => setFUsuario({ ...fUsuario, telefone: e.target.value })} placeholder="(11) 99999-0000" required /></div>
              <button type="submit" className="btn">Cadastrar Usuário</button>
            </form>
          </div>
          <div className="col">
            <div className="titulo-col">Usuários Cadastrados ({usuarios.length})</div>
            <div className="lista">
              {usuarios.length === 0 ? <p className="vazio">Nenhum usuário cadastrado.</p> : usuarios.map(u => (
                <div className="card" key={u.id}>
                  <p className="card-titulo">{u.nome}</p>
                  <p className="card-sub">{u.email}</p>
                  <p className="card-sub">{u.telefone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA EMPRÉSTIMOS */}
      {aba === "emprestimos" && (
        <div className="conteudo">
          <div className="col col-esq">
            <div className="titulo-col">Novo Empréstimo</div>
            <form onSubmit={salvarEmprestimo}>
              <div className="campo">
                <label>Usuário</label>
                <select value={fEmp.usuarioId} onChange={e => setFEmp({ ...fEmp, usuarioId: e.target.value })} required>
                  <option value="">Selecione o usuário...</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
              <div className="campo">
                <label>Data do Empréstimo</label>
                <input type="date" value={fEmp.dataEmprestimo} onChange={e => setFEmp({ ...fEmp, dataEmprestimo: e.target.value })} required />
              </div>
              <div className="campo">
                <label>Selecione os Livros</label>
                {livros.map(l => {
                  const disp = l.quantidade - l.qtdEmprestados
                  const esgotado = disp === 0
                  const marcado = fEmp.livrosIds.includes(l.id)
                  return (
                    <div key={l.id} className={`opcao ${marcado ? "marcado" : ""} ${esgotado ? "bloqueado" : ""}`}
                      onClick={() => !esgotado && marcarLivroEmp(l.id)}>
                      <input type="checkbox" checked={marcado} readOnly disabled={esgotado} />
                      <span>{l.titulo} <span style={{ color: "#8090a0", fontSize: ".78rem" }}>({esgotado ? "Esgotado" : `${disp} disp.`})</span></span>
                    </div>
                  )
                })}
              </div>
              <button type="submit" className="btn" disabled={fEmp.livrosIds.length === 0 || !fEmp.usuarioId}>
                Confirmar Empréstimo
              </button>
            </form>

            <hr className="divisor" />

            <div className="titulo-col">Registrar Devolução</div>
            <form onSubmit={salvarDevolucao}>
              <div className="campo">
                <label>Empréstimo Ativo</label>
                <select value={fDev.emprestimoId} onChange={e => setFDev({ emprestimoId: e.target.value, livrosIds: [] })}>
                  <option value="">Selecione o empréstimo...</option>
                  {emprestimos.filter(e => e.status === "ativo").map(e => (
                    <option key={e.id} value={e.id}>
                      {e.usuario?.nome ?? e.usuarioId} — {new Date(e.dataEmprestimo).toLocaleDateString("pt-BR")}
                    </option>
                  ))}
                </select>
              </div>
              {empAtivo && (
                <div className="campo">
                  <label>Livros para Devolver</label>
                  {(empAtivo.livros ?? []).map(l => {
                    const marcado = fDev.livrosIds.includes(l.id)
                    return (
                      <div key={l.id} className={`opcao ${marcado ? "marcado" : ""}`} onClick={() => marcarLivroDev(l.id)}>
                        <input type="checkbox" checked={marcado} readOnly />
                        <span>{l.titulo}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              <button type="submit" className="btn" disabled={!fDev.emprestimoId || fDev.livrosIds.length === 0}>
                Confirmar Devolução
              </button>
            </form>
          </div>

          <div className="col">
            <div className="titulo-col">Histórico de Empréstimos ({emprestimos.length})</div>
            <div className="lista">
              {emprestimos.length === 0 ? <p className="vazio">Nenhum empréstimo registrado.</p> :
                [...emprestimos].reverse().map(e => (
                  <div className="card" key={e.id}>
                    <div className="linha">
                      <span className="card-titulo">{e.usuario?.nome ?? e.usuarioId}</span>
                      <span className={`tag ${e.status === "ativo" ? "tag-verde" : "tag-azul"}`}>
                        {e.status === "ativo" ? "● Ativo" : "✓ Concluído"}
                      </span>
                    </div>
                    <p className="card-sub">Data: {new Date(e.dataEmprestimo).toLocaleDateString("pt-BR")}</p>
                    <p className="card-sub">
                      📖 {(e.livros && e.livros.length > 0) ? e.livros.map(l => l.titulo).join(", ") : e.livrosIds.join(", ")}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {aviso && <div className={`aviso ${aviso.ok ? "aviso-ok" : "aviso-err"}`}>{aviso.msg}</div>}
    </>
  )
}