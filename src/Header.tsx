import { useState } from 'react';
import {dbCollection, dbAdd, authSignOut } from './firebase'
import { v4 as uuidv4 } from 'uuid';
import { abrirModal, fecharModal, generateHorario } from './functions';
import { User } from 'firebase/auth';
import Logo from './images/logo-bioquimica.jpg';
import AulaImg from './images/class.png';
import CronImg from './images/add_cronograma.png';
import FeriImg from './images/add_holiday.png';
import PDFImg from './images/gerar_pdf.png';
import { useNavigate } from 'react-router-dom';
import { IAula, ICurso, IFeriado } from './types';

interface IProps {
    user: User,
    setUser: React.Dispatch<React.SetStateAction<any>>,
    cursos: Array<ICurso>,
    aulas: Array<IAula>,
    defaultFeriados: Array<string>,
    feriados: Array<IFeriado>
}

const defaultAula = {
    nome: '',
    curso: '',
    data: '',
    inicio: '',
    termino: ''
}

const defaultCurso = {
    id: '',
    info: {
      nome: '',
      aulas: [{
        nome: '',
        inicio: '',
        termino: ''
      }]
    }
}

function Header(props: IProps) {
    
    const [newAula, setNewAula] = useState(defaultAula);
    const [curso, setCurso] = useState(defaultCurso);
    const [outro, setOutro] = useState(false);
    const [arrayDatas, setArrayDatas] = useState(Array(30).fill(''));
    const [feriado, setFeriado] = useState('');
    const [pdf, setPdf] = useState('');

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

    const handleDateChange = (index: number, value: string) => {
        const newArrayDatas = [...arrayDatas];
        newArrayDatas[index] = value;
        setArrayDatas(newArrayDatas);
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
            fecharModal('.modalAddAula');
            setNewAula(defaultAula);
        } else {
            alert('Preencha todas as informações e tente novamente');
        }
    }

    function addCronograma() {
        curso.info.aulas.forEach((item, index) => {
            if (arrayDatas[index]) {
                const aulasRef = dbCollection('aulas');
                dbAdd(aulasRef, uuidv4(), {
                    nome: item.nome,
                    curso: curso.info.nome,
                    data: arrayDatas[index],
                    inicio: item.inicio,
                    termino: item.termino,
                    tecnico: ''
                })
            }
        })
        alert('Cronograma adicionado com sucesso!');
        fecharModal('.modalAddCronograma');
        setCurso(defaultCurso);
        setArrayDatas(Array(30).fill(''));
    }

    function addFeriado() {
        const feriadosRef = dbCollection('feriados');
        dbAdd(feriadosRef, uuidv4(), {
            data: feriado,
        })
        alert('Feriado adicionado com sucesso!');
        fecharModal('.modalAddFeriado');
        setFeriado('');
    }
    
    return (
        <aside>
            <div className="modal modalAddAula">
                <div onClick={() => {
                    fecharModal('.modalAddAula');
                    setNewAula(defaultAula);
                }} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2 onClick={() => console.log(newAula)}>Adicionar Aula</h2>
                    <form>
                        <label>Nome da aula</label>
                        <input type="text" value={newAula.nome} onChange={(e) => updateProps('nome', e.target.value)} />
                        <label>Curso</label>
                        <select value={newAula.curso} onChange={handleSelectChange}>
                            <option value=''></option>
                            {props.cursos.map((item => (
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

            <div className="modal modalAddCronograma">
                <div onClick={() => {
                    fecharModal('.modalAddCronograma');
                    setCurso(defaultCurso);
                    setArrayDatas(Array(30).fill(''));
                }} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2 onClick={() => console.log(newAula)}>Adicionar Cronograma</h2>
                    <form>
                        <label>Selecione o curso</label>
                        <select value={curso.id} onChange={(e) => setCurso(props.cursos.find(item => item.id === e.target.value) || defaultCurso)}>
                            <option value=''></option>
                            {props.cursos.map((item => (
                                <option key={item.id} value={item.id}>{item.info.nome}</option>
                            )))}
                        </select>
                        {curso.id && curso.info.aulas.map((item, index) => (
                            <div key={index}>
                                <p><b>{item.nome}</b> - Horário: {item.inicio} às {item.termino}</p>
                                <input type='date' value={arrayDatas[index]} onChange={(e) => handleDateChange(index, e.target.value)}/>
                            </div>
                        ))}
                    </form>
                    <button onClick={() => addCronograma()} disabled={!curso.id}>Salvar</button>
                </div>
            </div>

            <div className="modal modalAddFeriado">
                <div onClick={() => {
                    fecharModal('.modalAddFeriado');
                    setFeriado('');
                }} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2>Adicionar Feriado</h2>
                    <form>
                        <label>Selecione uma data</label>
                        <input type='date' value={feriado} onChange={(e) => setFeriado(e.target.value)}/>
                    </form>
                    <button onClick={() => addFeriado()} disabled={!feriado}>Adicionar</button>
                </div>
            </div>

            <div className="modal modalPDF">
                <div onClick={() => {
                    fecharModal('.modalPDF');
                    setPdf('');
                }} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2>Imprimir Horário</h2>
                    <form>
                        <label>Selecione um mês</label>
                        <input type="month" value={pdf} onChange={(e) => setPdf(e.target.value)} />
                    </form>
                    <button onClick={() => {
                        generateHorario(pdf, props.aulas, props.defaultFeriados, props.feriados);
                        fecharModal('.modalPDF');
                        setPdf('');
                    }} disabled={!pdf}>Gerar Horário</button>
                </div>
            </div>
            
            <div className="center">
                <div className="header_logo">
                    <a className='logo-pict' href='/'><img src={Logo} alt='DBIOq'/></a>
                </div>
                <div className='header_icons'>
                    {props.user?.email ?
                        <>        
                            <div className="option-item" onClick={(e) => abrirModal(e, '.modalAddAula')} >
                                <img src={AulaImg} alt='Aulas' />
                                <span>Adicionar Aulas</span>
                            </div>
                            <div className="option-item" onClick={(e) => abrirModal(e, '.modalAddCronograma')} >
                                <img src={CronImg} alt='Aulas' />
                                <span>Adicionar Cronograma</span>
                            </div>
                            <div className="option-item" onClick={(e) => abrirModal(e, '.modalAddFeriado')} >
                                <img src={FeriImg} alt='Aulas' />
                                <span>Adicionar Feriado</span>
                            </div>
                            <div className="option-item" onClick={(e) => abrirModal(e, '.modalPDF')} >
                                <img src={PDFImg} alt='Histórico' />
                                <span>Imprimir Horário</span>
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