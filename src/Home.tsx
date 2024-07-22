import { dbOnSnapshot, dbOrderBy, dbCollection } from "./firebase";
import Header from "./Header";
import { IAula } from "./types"
import { useEffect, useState } from "react";

interface IProps {
    user: any
    setUser: React.Dispatch<React.SetStateAction<any>>
}

function Home(props: IProps) {
    
    const [aulas, setAulas] = useState([] as Array<IAula>)
    
    const now = new Date();
    const nowTS = now.getTime();

    const arrayDatas = Array.from({ length: 120 }, (_, i) => {
        let newTS = nowTS + (i * 24 * 60 * 60 * 1000);
        return new Date(newTS)
    });

    const formatLongDate = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long'});
    const formatWeekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long'});

    

    useEffect(() => {
        const dbQuery = dbOrderBy(dbCollection("aulas"), 'data', 'asc');
        const unsubscribe = dbOnSnapshot(dbQuery, (querySnapshot) => {
          const aulas: IAula[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as IAula["info"]
            aulas.push({ id: doc.id, info: data });
          });
          setAulas(aulas);
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
                            <div className={item.getDay() === 5 ? "bodyDay bdFriday" : "bodyDay"}></div>
                        </div>    
                    )
                })}
            </div>
        </>
    )
}

export default Home