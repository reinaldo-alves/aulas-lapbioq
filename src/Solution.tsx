import AppMenu from "./AppMenu";
import { v4 as uuidv4 } from 'uuid';
import { dbOnSnapshot, dbOrderBy, dbCollection, dbDel, dbEdt, dbAdd } from "./firebase";
import { abrirModal, displayedDate, fecharModal } from "./functions";
import SolutionMenu from "./SolutionMenu";
import { ICategoria, ISolucao, ITecnico } from "./types"
import { useEffect, useState } from "react";

interface IProps {
    user: any
    setUser: React.Dispatch<React.SetStateAction<any>>
}

const defaultRegistro: ISolucao = {
    id: '',
    info: {
        data: '',
        nome: '',
        quantidade: '',
        tecnico: '',
        observacao: ''
    }
}

function Solution(props: IProps) {
    
    const [tecnicos, setTecnicos] = useState([] as Array<ITecnico>);
    const [solucoes, setSolucoes] = useState([] as Array<ICategoria>);
    const [registros, setRegistros] = useState([] as Array<ISolucao>);
    const [newRegistro, setNewRegistro] = useState(defaultRegistro as ISolucao);
    const [option, setOption] = useState('');
    const [historyOrder, setHistoryOrder] = useState('recant');
    const [filterSolucao, setFilterSolucao] = useState('');
    const [filterTecnico, setFilterTecnico] = useState('');
    
    const clickSingleClass = (e: React.MouseEvent, reg: ISolucao) => {
        if(props.user?.email) {
            setNewRegistro(reg);
            abrirModal(e, `#id_reg_${reg.id}`);
        }
    }
    
    const updateProps = (property: 'data' | 'nome' | 'quantidade' | 'tecnico' | 'observacao', newValue: string) => {
        setNewRegistro((prevData: any) => ({
            ...prevData,
            info: {
                ...prevData.info,
                [property]: newValue
            }
        }));
    };

    function addRegistro() {
        if (newRegistro.info.nome && newRegistro.info.data && newRegistro.info.quantidade && newRegistro.info.tecnico) {
            const registrosRef = dbCollection('registros');
            dbAdd(registrosRef, `${newRegistro.info.data}-${uuidv4()}`, {
                data: newRegistro.info.data,
                nome: newRegistro.info.nome,
                quantidade: newRegistro.info.quantidade,
                tecnico: newRegistro.info.tecnico,
                observacao: newRegistro.info.observacao || ''
            })
            alert('Registro de preparação de solução adicionado com sucesso!');
            fecharModal('.modalAddRegistro');
            setNewRegistro(defaultRegistro);
        } else {
            alert('Preencha todas as informações e tente novamente');
        }
    }

    const deleteRegistro = (reg: ISolucao) => {
        const prosseguir = window.confirm('Tem certeza que quer excluir esse registro de preparação de solução?');
        if (prosseguir) {
            dbDel("registros", reg.id);
            alert('Registro de preparação de solução excluído com sucesso');
            fecharModal(`#id_reg_${reg.id}`);
            setNewRegistro(defaultRegistro);
            setOption('');
        }
    }

    const editRegistro = (reg: ISolucao) => {
        dbEdt("registros", reg.id, newRegistro.info);
        alert('Registro de preparação de solução editado com sucesso');
        fecharModal(`#id_reg_${reg.id}`);
        setNewRegistro(defaultRegistro);
        setOption('');
    }

    useEffect(() => {
        const dbQueryTe = dbOrderBy(dbCollection("tecnicos"), 'nome', 'asc');
        const unsubscribeTe = dbOnSnapshot(dbQueryTe, (querySnapshot) => {
          const tecnicos: ITecnico[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as ITecnico["info"]
            tecnicos.push({ id: doc.id, info: data });
          });
          setTecnicos(tecnicos);
        });
        const dbQuerySo = dbCollection("solucoes");
        const unsubscribeSo = dbOnSnapshot(dbQuerySo, (querySnapshot) => {
          const solucoes: ICategoria[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as ICategoria["info"]
            solucoes.push({ id: doc.id, info: data });
          });
          solucoes.sort((a, b) => {return a.info.nome.localeCompare(b.info.nome, 'pt-BR', { sensitivity: 'base' })});
          setSolucoes(solucoes);
        });
        const dbQueryRe = dbOrderBy(dbCollection("registros"), 'data', 'desc');
        const unsubscribeRe = dbOnSnapshot(dbQueryRe, (querySnapshot) => {
          const registros: ISolucao[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as ISolucao["info"]
            registros.push({ id: doc.id, info: data });
          });
          setRegistros(registros);
        });
    }, [])
   
    return (
        <>
            <AppMenu />
            <SolutionMenu user={props.user} setUser={props.setUser} solucoes={solucoes} registros={registros} />
            <div className="mainContainer">
                <h1>Registro de Preparação de Soluções</h1>
                <div className="modalHistory" style={{textAlign: "center"}}>
                    <p>Ordenar: 
                        <select onChange={(e) => setHistoryOrder(e.target.value)}>
                            <option value={'recant'}>Mais recente para mais antigo</option>
                            <option value={'antrec'}>Mais antigo para mais recente</option>
                        </select>
                    </p>
                    <p>Filtro por solução: 
                        <select onChange={(e) => setFilterSolucao(e.target.value)}>
                            <option value={''}>Todos</option>
                            {solucoes.map(s => (
                                <option key={s.id} value={s.info.nome}>{s.info.nome}</option>
                            ))}
                        </select>
                    </p>
                    <p>Filtro por técnico: 
                        <select onChange={(e) => setFilterTecnico(e.target.value)}>
                            <option value={''}>Todos</option>
                            {tecnicos.map(t => (
                                <option key={t.id} value={t.info.nome}>{t.info.nome}</option>
                            ))}
                        </select>
                    </p>
                    <button onClick={(e) => abrirModal(e, '.modalAddRegistro')}>Adicionar registro</button>
                </div>
                <div className="modal modalAddRegistro">
                    <div onClick={() => {
                        fecharModal('.modalAddRegistro');
                        setNewRegistro(defaultRegistro);
                    }} className="close-modal">X</div>
                    <div className="modalContainer">
                        <h2>Adicionar Registro</h2>
                        <form>
                            <label>Data</label>
                            <input type="date" value={newRegistro.info.data} onChange={(e) => updateProps('data', e.target.value)} />
                            <label>Solução</label>
                            <select value={newRegistro.info.nome} onChange={(e) => updateProps('nome', e.target.value)}>
                                <option value=''></option>
                                {solucoes.map((item => (
                                    <option key={item.id} value={item.info.nome}>{item.info.nome}</option>
                                )))}
                            </select>
                            <label>Quantidade</label>
                            <input type="text" value={newRegistro.info.quantidade} onChange={(e) => updateProps('quantidade', e.target.value)} />
                            <label>Técnico</label>
                            <select value={newRegistro.info.tecnico} onChange={(e) => updateProps('tecnico', e.target.value)}>
                                <option value=''></option>
                                {tecnicos.map((item => (
                                    <option key={item.id} value={item.info.nome}>{item.info.nome}</option>
                                )))}
                            </select>
                            <label>Observações</label>
                            <textarea value={newRegistro.info.observacao} onChange={(e) => updateProps('observacao', e.target.value)}></textarea>
                        </form>
                        <button onClick={() => addRegistro()}>Adicionar</button>
                    </div>
                </div>
                <table className="tableSolution">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Registros</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...registros]
                            .sort((a: ISolucao, b: ISolucao) => historyOrder === 'antrec' ? a.info.data.localeCompare(b.info.data) : b.info.data.localeCompare(a.info.data))
                            .filter(item => filterSolucao === "" || item.info.nome === filterSolucao)
                            .filter(item => filterTecnico === "" || item.info.tecnico === filterTecnico)
                            .map((item: ISolucao) => (
                                <tr key={item.id}>
                                    <td>{displayedDate(item.info.data)}</td>
                                    <td style={{cursor: 'pointer'}} onClick={(e) => clickSingleClass(e, item)}>{item.info.nome} ({item.info.quantidade})<span style={{display: item.info.tecnico ? 'inline' : 'none', color: `${tecnicos.find(t => t.info.nome === item.info.tecnico) ? tecnicos.find(t => t.info.nome === item.info.tecnico)?.info.cor : '#000'}`}}> - {item.info.tecnico}</span><br/><span style={{fontSize: '12px', display: item.info.observacao? 'inline' : 'none'}}>Observação: {item.info.observacao}</span></td>
                                    <div className="modal" id={`id_reg_${item.id}`}>
                                        <div onClick={() => {
                                            fecharModal(`#id_reg_${item.id}`);
                                            setNewRegistro(defaultRegistro);
                                            setOption('');
                                        }} className="close-modal">X</div>
                                        <div className="modalContainer modalSingleClass">
                                            <h2>{item.info.nome} - ({item.info.quantidade})</h2>
                                            <h3>{displayedDate(item.info.data)} - {item.info.tecnico}</h3>
                                            <button onClick={() => setOption('editar')}>Editar Registro</button>
                                            <br/>
                                            {option === 'editar' &&
                                                <form>
                                                    <label>Data</label>
                                                    <input type="date" value={newRegistro.info.data} onChange={(e) => updateProps('data', e.target.value)} />
                                                    <label>Solução</label>
                                                    <select value={newRegistro.info.nome} onChange={(e) => updateProps('nome', e.target.value)}>
                                                        <option value=''></option>
                                                        {solucoes.map((s => (
                                                            <option key={s.id} value={s.info.nome}>{s.info.nome}</option>
                                                        )))}
                                                    </select>
                                                    <label>Quantidade</label>
                                                    <input type="text" value={newRegistro.info.quantidade} onChange={(e) => updateProps('quantidade', e.target.value)} />
                                                    <label>Técnico</label>
                                                    <select value={newRegistro.info.tecnico} onChange={(e) => updateProps('tecnico', e.target.value)}>
                                                        <option value=''></option>
                                                        {tecnicos.map((t => (
                                                            <option key={t.id} value={t.info.nome}>{t.info.nome}</option>
                                                        )))}
                                                    </select>
                                                    <label>Observações</label>
                                                    <textarea value={newRegistro.info.observacao} onChange={(e) => updateProps('observacao', e.target.value)}></textarea>
                                                    <button onClick={() => editRegistro(item)}>Salvar Alterações</button>
                                                </form>}
                                            <button onClick={() => deleteRegistro(item)}>Excluir Registro</button>
                                        </div>
                                    </div>
                                </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Solution