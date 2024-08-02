import { dbOnSnapshot, dbOrderBy, dbCollection, dbDel, dbEdt } from "./firebase";
import { abrirModal, convertDateToString, displayedHour, fecharModal } from "./functions";
import Header from "./Header";
import { IAula, ICurso, IFeriado, ITecnico } from "./types"
import { useEffect, useRef, useState } from "react";

interface IProps {
    user: any
    setUser: React.Dispatch<React.SetStateAction<any>>
}

const defaultFeriados = ['01-01', '04-21', '05-01', '07-16', '09-07', '10-12', '11-02', '11-15', '12-08', '12-24', '12-25', '12-31'];

function Home(props: IProps) {
    
    const [aulas, setAulas] = useState([] as Array<IAula>);
    const [cursos, setCursos] = useState([] as Array<ICurso>);
    const [tecnicos, setTecnicos] = useState([] as Array<ITecnico>);
    const [feriados, setFeriados] = useState([] as Array<IFeriado>);
    const [option, setOption] = useState('');
    const [editAula, setEditAula] = useState({} as IAula);
    
    const now = new Date();
    const nowTS = now.getTime();
    const dayRefs = useRef([] as Array<HTMLDivElement | null>);

    const arrayDatas = Array.from({ length: 240 }, (_, i) => {
        let newTS = nowTS - (120 * 24 * 60 * 60 * 1000) + (i * 24 * 60 * 60 * 1000);
        return new Date(newTS)
    });

    const formatLongDate = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long'});
    const formatWeekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long'});

    const setDayRef = (index: number, element: HTMLDivElement | null) => {
        dayRefs.current[index] = element;
    };

    const targetDate = () => {
        const getNextMonday = (date: Date): Date => {
            const day = date.getDay();
            const diff = day === 0 ? 1 : (day === 6 ? 2 : 0);
            const nextMonday = new Date(date);
            nextMonday.setDate(date.getDate() + diff);
            return nextMonday;
        };
        const finalValue = now.getDay() === 0 || now.getDay() === 6 ? getNextMonday(now) : now;
        return finalValue;
    };
    
    const clickSingleClass = (e: React.MouseEvent, aula: IAula) => {
        if(props.user?.email) {
            setEditAula(aula);
            abrirModal(e, `#id_${aula.id}`);
        }
    }
    
    const updateProps = (property: string, newValue: any) => {
        setEditAula((prevData: any) => ({
            ...prevData,
            info: {
                ...prevData.info,
                [property]: newValue
            }
        }));
    };

    const deleteAula = (aula: IAula) => {
        dbDel("aulas", aula.id);
        alert('Aula excluída com sucesso');
        fecharModal(`#id_${aula.id}`);
        setEditAula({} as IAula);
        setOption('');
    }

    const editTecnico = (aula: IAula) => {
        dbEdt("aulas", aula.id, {tecnico: editAula.info.tecnico});
        alert('Técnico atribuído com sucesso');
        fecharModal(`#id_${aula.id}`);
        setEditAula({} as IAula);
        setOption('');
    }

    const handleEditAula = (aula: IAula) => {
        dbEdt("aulas", aula.id, editAula.info);
        alert('Aula editada com sucesso');
        fecharModal(`#id_${aula.id}`);
        setEditAula({} as IAula);
        setOption('');
    }

    useEffect(() => {
        const targetIndex = arrayDatas.filter(item => item.getDay() > 0 && item.getDay() < 6).findIndex((item) => convertDateToString(item) === convertDateToString(targetDate()));;
        if (dayRefs.current[targetIndex]) {
            dayRefs.current[targetIndex]?.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        const dbQueryAu = dbOrderBy(dbCollection("aulas"), 'inicio', 'asc');
        const unsubscribeAu = dbOnSnapshot(dbQueryAu, (querySnapshot) => {
          const aulas: IAula[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as IAula["info"]
            aulas.push({ id: doc.id, info: data });
          });
          setAulas(aulas);
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
        const dbQueryTec = dbOrderBy(dbCollection("tecnicos"), 'nome', 'asc');
        const unsubscribeTec = dbOnSnapshot(dbQueryTec, (querySnapshot) => {
          const tecnicos: ITecnico[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as ITecnico["info"]
            tecnicos.push({ id: doc.id, info: data });
          });
          setTecnicos(tecnicos);
        });
        const dbQueryFe = dbOrderBy(dbCollection("feriados"), 'data', 'asc');
        const unsubscribeFe = dbOnSnapshot(dbQueryFe, (querySnapshot) => {
          const feriados: IFeriado[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as IFeriado["info"]
            feriados.push({ id: doc.id, info: data });
          });
          setFeriados(feriados);
        });
    }, [])

    useEffect(() => {
        dayRefs.current = Array(240).fill(null);
    }, []);
   
    return (
        <>
            <Header user={props.user} setUser={props.setUser} cursos={cursos} aulas={aulas} defaultFeriados={defaultFeriados} feriados={feriados}/>
            <div className="mainContainer">
                {arrayDatas.filter(item => item.getDay() > 0 && item.getDay() < 6).map((item, index) => {
                    return (
                        <div key={index} ref={(el) => setDayRef(index, el)}>
                            <div className={`headerDay${convertDateToString(item) === convertDateToString(now) ? " bdToday" : ""}`}>
                                <span>{formatLongDate.format(item)}{convertDateToString(item) === convertDateToString(now) ? " - HOJE" : ""}</span>
                                <span>{formatWeekday.format(item)}</span>
                            </div>
                            <div className={`bodyDay${item.getDay() === 5 ? " bdFriday" : ""}${defaultFeriados.includes(convertDateToString(item).slice(5)) || feriados.some(el => el.info.data === convertDateToString(item)) ? " bdHoliday" : ""}`}>
                                {defaultFeriados.includes(convertDateToString(item).slice(5)) || feriados.some(el => el.info.data === convertDateToString(item)) ? 
                                    <p>FERIADO</p>
                                : aulas.filter(aula => aula.info.data === convertDateToString(item)).map(aula => (
                                    <div key={aula.id}>
                                        <div className="class-container">
                                            <div className="tec-icon" style={{backgroundColor: `${tecnicos.find(t => t.info.nome === aula.info.tecnico) ? tecnicos.find(t => t.info.nome === aula.info.tecnico)?.info.cor : '#fff'}`}}>{aula.info.tecnico.charAt(0)}</div>
                                            <span className="class-single" key={aula.id} onClick={(e) => clickSingleClass(e, aula)}>{displayedHour(aula.info.inicio)}-{displayedHour(aula.info.termino)}: {aula.info.nome} ({aula.info.curso.split('/')[0].toUpperCase()})</span>
                                        </div>
                                        <div className="modal" id={`id_${aula.id}`}>
                                            <div onClick={() => {
                                                fecharModal(`#id_${aula.id}`);
                                                setEditAula({} as IAula);
                                                setOption('');
                                            }} className="close-modal">X</div>
                                            <div className="modalContainer modalSingleClass">
                                                <h2>{aula.info.nome} - {aula.info.curso.split('/')[0]}</h2>
                                                <h3>{String(item.getDate()).padStart(2,'0')}/{String(item.getMonth() + 1).padStart(2,'0')} - {aula.info.inicio} às {aula.info.termino}</h3>
                                                <button onClick={() => setOption('tecnico')}>Atribuir Técnico</button>
                                                <br/>
                                                {option === 'tecnico' &&
                                                    <form>
                                                        <label>Selecione o técnico</label>
                                                        <select value={editAula.info.tecnico} onChange={(e) => updateProps('tecnico', e.target.value)} >
                                                            <option value=''></option>
                                                            {tecnicos.map((item => (
                                                                <option key={item.id} value={item.info.nome}>{item.info.nome}</option>
                                                            )))}
                                                        </select>
                                                        <button onClick={() => editTecnico(aula)}>Confirmar</button>
                                                    </form>}
                                                <button onClick={() => setOption('editar')}>Editar Aula</button>
                                                <br/>
                                                {option === 'editar' &&
                                                    <form>
                                                        <label>Nome da aula</label>
                                                        <input type="text" value={editAula.info.nome} onChange={(e) => updateProps('nome', e.target.value)} />
                                                        <label>Curso</label>
                                                        <select value={editAula.info.curso} onChange={(e) => updateProps('curso', e.target.value)}>
                                                            <option value=''></option>
                                                            {cursos.map((item => (
                                                                <option key={item.id} value={item.info.nome}>{item.info.nome}</option>
                                                            )))}
                                                        </select>
                                                        <label>Data da Aula</label>
                                                        <input type="date" value={editAula.info.data} onChange={(e) => updateProps('data', e.target.value)} />
                                                        <label>Horário de início</label>
                                                        <input type="time" value={editAula.info.inicio} onChange={(e) => updateProps('inicio', e.target.value)} />
                                                        <label>Horário de término</label>
                                                        <input type="time" value={editAula.info.termino} onChange={(e) => updateProps('termino', e.target.value)} />
                                                        <button onClick={() => handleEditAula(aula)}>Salvar Alterações</button>
                                                    </form>}
                                                <button onClick={() => deleteAula(aula)}>Excluir Aula</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>    
                    )
                })}
            </div>
        </>
    )
}

export default Home