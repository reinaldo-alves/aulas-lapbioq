import { useEffect, useState } from 'react';
import {dbCollection, dbAdd, authSignOut, dbOrderBy, dbOnSnapshot } from './firebase'
import { v4 as uuidv4 } from 'uuid';
import { abrirModal, fecharModal } from './functions';
import { User } from 'firebase/auth';
import Logo from './images/logo-bioquimica.jpg';
import AulaImg from './images/class.png';
import TecImg from './images/tecnician.png';
import HistImg from './images/history.png';
import { useNavigate } from 'react-router-dom';
import { ICurso, ITecnico } from './types';

interface IProps {
    user: User,
    setUser: React.Dispatch<React.SetStateAction<any>>,
}

const defaultAula = {
    nome: '',
    curso: '',
    data: '',
    inicio: '',
    termino: '',
    tecnico: ''
}

function Header(props: IProps) {
    
    const [cursos, setCursos] = useState([] as Array<ICurso>);
    const [tecnicos, setTecnicos] = useState([] as Array<ITecnico>);
    const [newAula, setNewAula] = useState(defaultAula);
    const [outro, setOutro] = useState(false);

    const navigate = useNavigate();

    const updateProps = (property: string, newValue: any) => {
        setNewAula((prevData: any) => ({
            ...prevData,
            [property]: newValue
        }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        updateProps('curso', value);
        if (value === 'outro') {
            setOutro(true);
        } else {
            setOutro(false);
        }
    };

    function handleLogout(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        authSignOut((val) => {
            props.setUser(null);
            window.location.href = '/';
        })
    }

    function addAula() {
        if (newAula.nome && newAula.curso && newAula.data && newAula.inicio && newAula.termino) {
            const aulasRef = dbCollection('aulas');
            dbAdd(aulasRef, uuidv4(), {
                nome: newAula.nome,
                curso: newAula.curso,
                data: newAula.data,
                inicio: newAula.inicio,
                termino: newAula.termino,
                tecnico: ''
            })
            alert('Aula adicionada com sucesso!');
            fecharModal('.modalAddAula')
        } else {
            alert('Preencha todas as informações e tente novamente');
        }
        
        
    }

    useEffect(() => {
        const dbQueryTec = dbOrderBy(dbCollection("tecnicos"), 'nome', 'asc');
        const unsubscribeTec = dbOnSnapshot(dbQueryTec, (querySnapshot) => {
          const tecnicos: ITecnico[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as ITecnico["info"]
            tecnicos.push({ id: doc.id, info: data });
          });
          setTecnicos(tecnicos);
        });
        const dbQueryCur = dbOrderBy(dbCollection("cursos"), 'nome', 'asc');
        const unsubscribeCur = dbOnSnapshot(dbQueryCur, (querySnapshot) => {
          const cursos: ICurso[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as ICurso["info"]
            cursos.push({ id: doc.id, info: data });
          });
          setCursos(cursos);
        });
    }, [])
    
    return (
        <aside>
            <div className="modal modalTecnico">
                <div onClick={() => fecharModal('.modalTecnico')} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2>Selecione o Técnico</h2>
                    <select>
                        <option value=''></option>
                        {tecnicos.map((item => (
                            <option key={item.id} value={item.info.nome}>{item.info.nome}</option>
                        )))}
                    </select>
                    <button onClick={() => {}}>Confirmar</button>
                </div>
            </div>

            <div className="modal modalAula">
                <div onClick={() => fecharModal('.modalAula')} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2>Gerenciar Aulas</h2>
                    <button onClick={(e) => {
                        fecharModal('.modalAula');
                        abrirModal(e, '.modalAddAula')
                    }}>Adicionar Aula</button>
                    <form id='form-upload' onSubmit={(e) => {}}>
                        <input id='titulo-upload' type="text" placeholder='Nome da sua foto...' />
                        <input onChange={(e) => {}} type="file" name='file' />
                        <select>
                            <option value=''>Selecione um curso...</option>
                            {cursos.map((item => (
                                <option key={item.id} value={item.info.nome}>{item.info.nome}</option>
                            )))}
                        </select>
                        <input type="submit" value='Postar no Instagram!' />
                    </form>
                </div>
            </div>

            <div className="modal modalAddAula">
                <div onClick={() => fecharModal('.modalAddAula')} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2 onClick={() => console.log(newAula)}>Adicionar Aula</h2>
                    <form>
                        <label>Nome da aula</label>
                        <input type="text" value={newAula.nome} onChange={(e) => updateProps('nome', e.target.value)} />
                        <label>Curso</label>
                        <select value={newAula.curso} onChange={handleSelectChange}>
                            <option value=''></option>
                            {cursos.map((item => (
                                <option key={item.id} value={item.info.nome}>{item.info.nome}</option>
                            )))}
                            <option value='outro'>Outro</option>
                        </select>
                        {outro && (
                            <input className='inputAddCurso' type="text" value={newAula.curso} onChange={(e) => updateProps('curso', e.target.value)} />
                        )}
                        <label>Data da Aula</label>
                        <input type="date" value={newAula.data} onChange={(e) => updateProps('data', e.target.value)} />
                        <label>Horário de início</label>
                        <input type="time" value={newAula.inicio} onChange={(e) => updateProps('inicio', e.target.value)} />
                        <label>Horário de término</label>
                        <input type="time" value={newAula.termino} onChange={(e) => updateProps('termino', e.target.value)} />
                    </form>
                    <button onClick={() => addAula()}>Adicionar</button>
                </div>
            </div>

            <div className="modal modalHistorico">
                <div onClick={() => fecharModal('.modalHistorico')} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2>Aulas Anteriores</h2>
                    <form id='form-upload' onSubmit={(e) => {}}>
                        <input id='titulo-upload' type="text" placeholder='Nome da sua foto...' />
                        <input onChange={(e) => {}} type="file" name='file' />
                        <input type="submit" value='Postar no Instagram!' />
                    </form>
                </div>
            </div>
            
            <div className="center">
                <div className="header_logo">
                    <a className='logo-pict' href='/'><img src={Logo} alt='DBIOq'/></a>
                </div>
                <div className='header_icons'>
                    {props.user?.email ?
                        <>        
                            <div className="option-item" onClick={(e) => abrirModal(e, '.modalTecnico')} >
                                <img src={TecImg} alt='Técnico' />
                                <span>Técnicos</span>
                            </div>
                            <div className="option-item" onClick={(e) => abrirModal(e, '.modalAula')} >
                                <img src={AulaImg} alt='Aulas' />
                                <span>Aulas</span>
                            </div>
                            <div className="option-item" onClick={(e) => abrirModal(e, '.modalHistorico')} >
                                <img src={HistImg} alt='Histórico' />
                                <span>Histórico</span>
                            </div>
                            <div className="option-item" onClick={(e) => handleLogout(e)} >
                                <img src='https://cdn-icons-png.flaticon.com/512/126/126467.png' alt='Sair' />
                                <span>Sair</span>
                            </div>
                        </>
                    :
                        <button className='btn-login' onClick={() => navigate('/login')}>Login</button>
                    }                   
                </div>
            </div>
        </aside> 
    )
}

export default Header