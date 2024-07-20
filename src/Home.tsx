import { dbOnSnapshot, dbOrderBy, dbCollection } from "./firebase";
import Header from "./Header";
import { ITecnico } from "./types"
import { useEffect, useState } from "react";

interface IProps {
    user: any
    setUser: React.Dispatch<React.SetStateAction<any>>
}

function Home(props: IProps) {
    
    const [tecnicos, setTecnicos] = useState([] as Array<ITecnico>)
    
    const now = new Date();
    const nowTS = now.getTime();

    const arrayDatas = Array.from({ length: 120 }, (_, i) => {
        let newTS = nowTS + (i * 24 * 60 * 60 * 1000);
        return new Date(newTS)
    });

    const formatLongDate = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long'});
    const formatWeekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long'});

    useEffect(() => {
        const dbQuery = dbOrderBy(dbCollection("tecnicos"), 'nome', 'asc');
        const unsubscribe = dbOnSnapshot(dbQuery, (querySnapshot) => {
          const tecnicos: ITecnico[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as ITecnico["info"]
            tecnicos.push({ id: doc.id, info: data });
          });
          setTecnicos(tecnicos);
        });
    }, [])
   
    return (
        <>
            <Header user={props.user} setUser={props.setUser} tecnicos={tecnicos} />
            <div className="mainContainer">
                {arrayDatas.filter(item => item.getDay() > 0 && item.getDay() < 6).map((item, index) => {
                    return (
                        <div key={index}>
                            <div className="headerDay">
                                <span>{formatLongDate.format(item)}</span>
                                <span>{formatWeekday.format(item)}</span>
                            </div>
                            <div className={item.getDay() === 5 ? "bodyDay bdFriday" : "bodyDay"}></div>
                        </div>
                        
                    )
                })}
            </div>
        </>
    )
}

export default Home