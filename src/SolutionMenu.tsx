import { useState } from 'react';
import { dbCollection, dbAdd, authSignOut, dbEdt, dbDel } from './firebase'
import { v4 as uuidv4 } from 'uuid';
import { abrirModal, fecharModal } from './functions';
import { User } from 'firebase/auth';
import AddImg from './images/sol_add.png';
import EdtImg from './images/sol_edit.png';
import RmvImg from './images/sol_remove.png';
import { useNavigate } from 'react-router-dom';
import { ICategoria, ISolucao } from './types';

interface IProps {
    user: User,
    setUser: React.Dispatch<React.SetStateAction<any>>,
    solucoes: Array<ICategoria>,
    registros: Array<ISolucao>
}

const defaultSolucao = {
    id: '',
    info: {
        nome: ''
    }
}

function SolutionMenu(props: IProps) {
    
    const [solucao, setSolucao] = useState(defaultSolucao);
    const [newSolucao, setNewSolucao] = useState('');

    const navigate = useNavigate();

    const selectSolucao = (nome: string) => {
        const findSol = props.solucoes.find(s => s.info.nome === nome);
        const sol = findSol === undefined ? defaultSolucao : findSol;
        setSolucao(sol);
    };

    function handleLogout(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        authSignOut((val) => {
            props.setUser(null);
            window.location.href = '/solucoes';
        })
    }

    function addSolucao() {
        const solucoesRef = dbCollection('solucoes');
        dbAdd(solucoesRef, uuidv4(), {
            nome: newSolucao,
        })
        alert('Solução adicionada com sucesso!');
        fecharModal('.modalAddSolucao');
        setNewSolucao('');
    }

    const editSolucao = (sol: ICategoria) => {
        if(newSolucao !== sol.info.nome) {
            props.registros.filter(r => r.info.nome === sol.info.nome).forEach(i => dbEdt("registros", i.id, {nome: newSolucao}));
        }
        dbEdt("solucoes", sol.id, {nome: newSolucao});
        alert('Solução editada com sucesso');
        fecharModal('.modalEditSolucao');
        selectSolucao('');
        setNewSolucao('');
    }

    const deleteSolucao = (sol: ICategoria) => {
        const solRegistros = props.registros.filter(r => r.info.nome === sol.info.nome).length;
        if (solRegistros > 0) {
            alert(`Há ${solRegistros} registros com esta solução. Edite ou exclua estes registros antes de excluir a solução`);
        }
        const prosseguir = window.confirm('Tem certeza que quer excluir essa solução?');
        if (prosseguir) {
            dbDel("solucoes", sol.id);
            alert('Solução excluída com sucesso');
            fecharModal('.modalDelSolucao');
            selectSolucao('');
        }
    }
    
    return (
        <aside id='asideMenu'>
            <div className="modal modalSolutionMenu">
                <div onClick={() => fecharModal('.modalSolutionMenu')} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2>Menu Principal</h2>
                    <div className="main-menu-item" onClick={(e) => {
                        fecharModal('.modalSolutionMenu');
                        abrirModal(e, '.modalAddSolucao');
                    }}>
                        <img src={AddImg} alt='Adicionar Solução' />
                        <span>Adicionar Solução</span>
                    </div>
                    <div className="main-menu-item" onClick={(e) => {
                        fecharModal('.modalSolutionMenu');
                        abrirModal(e, '.modalEditSolucao');
                    }}>
                        <img src={EdtImg} alt='Editar Solução' />
                        <span>Editar Solução</span>
                    </div>
                    <div className="main-menu-item" onClick={(e) => {
                        fecharModal('.modalSolutionMenu');
                        abrirModal(e, '.modalDelSolucao');
                    }}>
                        <img src={RmvImg} alt='Excluir Solução' />
                        <span>Excluir Solução</span>
                    </div>
                    <div className="main-menu-item" onClick={(e) => handleLogout(e)} >
                        <img src='https://cdn-icons-png.flaticon.com/512/126/126467.png' alt='Sair' />
                        <span>Sair</span>
                    </div>
                </div>
            </div>

            <div className="modal modalAddSolucao">
                <div onClick={() => {
                    fecharModal('.modalAddSolucao');
                    setNewSolucao('');
                }} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2>Editar Solução</h2>
                    <form>
                        <label>Nome da Solução</label>
                        <input value={newSolucao} onChange={(e) => setNewSolucao(e.target.value)}/>
                    </form>
                    <button onClick={() => addSolucao()} disabled={!newSolucao}>Adicionar</button>
                </div>
            </div>

            <div className="modal modalEditSolucao">
                <div onClick={() => {
                    fecharModal('.modalEditSolucao');
                    selectSolucao('');
                    setNewSolucao('');
                }} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2>Adicionar Solução</h2>
                    <form>
                        <label>Selecione uma solução</label>
                        <select value={solucao.info.nome} onChange={(e) => {
                            setNewSolucao(e.target.value);
                            selectSolucao(e.target.value);
                        }}>
                            {[defaultSolucao, ...props.solucoes].map(s => (
                                <option key={s.id} value={s.info.nome}>{s.info.nome}</option>
                            ))}
                        </select>
                        <label>Novo nome da solução</label>
                        <input value={newSolucao} onChange={(e) => setNewSolucao(e.target.value)}/>
                    </form>
                    <button onClick={() => editSolucao(solucao)} disabled={!solucao.id}>Salvar Alteração</button>
                </div>
            </div>

            <div className="modal modalDelSolucao">
                <div onClick={() => {
                    fecharModal('.modalDelSolucao');
                    selectSolucao('');
                }} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2>Excluir Solução</h2>
                    <form>
                        <label>Selecione uma solução</label>
                        <select value={solucao.info.nome} onChange={(e) => selectSolucao(e.target.value)}>
                            {[defaultSolucao, ...props.solucoes].map(s => (
                                <option key={s.id} value={s.info.nome}>{s.info.nome}</option>
                            ))}
                        </select>
                    </form>
                    <button onClick={() => deleteSolucao(solucao)} disabled={!solucao.id}>Excluir</button>
                </div>
            </div>
            
            {props.user?.email ?
                <div className='btn-menu' onClick={(e) => abrirModal(e, '.modalSolutionMenu')}>Menu</div>
            :
                <button className='btn-login' onClick={() => navigate('/login')}>Login</button>
            }                   
        </aside> 
    )
}

export default SolutionMenu