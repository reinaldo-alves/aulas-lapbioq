import { dbOnSnapshot, dbOrderBy, dbCollection } from "./firebase";
import { abrirModal, convertDateToString, displayedHour, fecharModal } from "./functions";
import Header from "./Header";
import { IAula, IFeriado } from "./types"
import { useEffect, useState } from "react";

interface IProps {
    user: any
    setUser: React.Dispatch<React.SetStateAction<any>>
}

const defaultFeriados = ['01-01', '04-21', '05-01', '07-16', '09-07', '10-12', '11-02', '11-15', '12-08', '12-24', '12-25', '12-31'];

function Home(props: IProps) {
    
    const [aulas, setAulas] = useState([] as Array<IAula>)
    const [feriados, setFeriados] = useState([] as Array<IFeriado>)
    
    const now = new Date();
    const nowTS = now.getTime();

    const arrayDatas = Array.from({ length: 120 }, (_, i) => {
        let newTS = nowTS + (i * 24 * 60 * 60 * 1000);
        return new Date(newTS)
    });

    const formatLongDate = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long'});
    const formatWeekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long'});

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
   
    return (
        <>
            <Header user={props.user} setUser={props.setUser} />
            <div className="mainContainer">
                {arrayDatas.filter(item => item.getDay() > 0 && item.getDay() < 6).map((item, index) => {
                    return (
                        <div key={index}>
                            <div className="headerDay">
                                <span>{formatLongDate.format(item)}</span>
                                <span>{formatWeekday.format(item)}</span>
                            </div>
                            <div className={`bodyDay${item.getDay() === 5 ? " bdFriday" : ""}${defaultFeriados.includes(convertDateToString(item).slice(5)) || feriados.some(el => el.info.data === convertDateToString(item)) ? " bdHoliday" : ""}`}>
                                {defaultFeriados.includes(convertDateToString(item).slice(5)) || feriados.some(el => el.info.data === convertDateToString(item)) ? 
                                    <p>FERIADO</p>
                                : aulas.filter(aula => aula.info.data === convertDateToString(item)).map(aula => (
                                    <div key={aula.id}>
                                        <span className="class-single" key={aula.id} onClick={(e) => abrirModal(e, `#id_${aula.id}`)}>{displayedHour(aula.info.inicio)}-{displayedHour(aula.info.termino)}: {aula.info.nome} ({aula.info.curso.split('/')[0].toUpperCase()})</span>
                                        <div className="modal" id={`id_${aula.id}`}>
                                            <div onClick={() => fecharModal(`#id_${aula.id}`)} className="close-modal">X</div>
                                            <div className="modalContainer">
                                                <h2>{aula.info.nome} - {aula.info.curso.split('/')[0]}</h2>
                                                <h3>{String(item.getDate()).padStart(2,'0')}/{String(item.getMonth() + 1).padStart(2,'0')} - {aula.info.inicio} às {aula.info.termino}</h3>
                                                <button onClick={(e) => {
                                                    fecharModal('.modalSingleAula');
                                                    abrirModal(e, '.modalSingleAula');
                                                }}>Atribuir Técnico</button>
                                                <br/>
                                                <button onClick={(e) => {
                                                    fecharModal('.modalSingleAula');
                                                    abrirModal(e, '.modalSingleAula');
                                                }}>Editar Aula</button>
                                                <br/>
                                                <button onClick={(e) => {
                                                    fecharModal('.modalSingleAula');
                                                    abrirModal(e, '.modalSingleAula');
                                                }}>Excluir Aula</button>
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