import { dbDoc, dbOnSnapshot, dbOrderBy, dbSubCollection } from "./firebase";
import { IComent, ILike } from "./types"
import { useEffect, useState } from "react";
import fullHeart from "./images/coracao1.png"
import commentIcon from "./images/comment.png"

function Home() {
    
    const [comentarios, setComentarios] = useState<IComent[]>([]);
    const [curtidas, setCurtidas] = useState<ILike[]>([]);
    
    const now = new Date();
    const nowTS = now.getTime();

    const arrayDatas = Array.from({ length: 120 }, (_, i) => {
        let newTS = nowTS + (i * 24 * 60 * 60 * 1000);
        return new Date(newTS)
    });

    const formatLongDate = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long'});
    const formatWeekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long'});

    useEffect(() => {
        const postsRef = dbDoc('posts', 'id');
        const commentsCol = dbSubCollection(postsRef, 'comentarios');
        const commentQuery = dbOrderBy(commentsCol, 'timestamp', 'asc');
        const unsubscribeCom = dbOnSnapshot(commentQuery, (querySnapshot) => {
        const comments: IComent[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as IComent["info"]
            comments.push({ id: doc.id, info: data });
        });
        setComentarios(comments);
        });
        const likeCol = dbSubCollection(postsRef, 'curtidas');
        const likeQuery = dbOrderBy(likeCol, 'timestamp', 'desc');
        const unsubscribeLik = dbOnSnapshot(likeQuery, (querySnapshot) => {
        const likes: ILike[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as ILike["info"]
            likes.push({ id: doc.id, info: data });
        });
        setCurtidas(likes);
        });
    }, [])
   
    return (
        <div className="mainContainer">
            {arrayDatas.filter(item => item.getDay() > 0 && item.getDay() < 6).map((item, index) => {
                return (
                    <>
                        <div className="headerDay">
                            <span>{formatLongDate.format(item)}</span>
                            <span>{formatWeekday.format(item)}</span>
                        </div>
                        <div className="bodyDay"></div>
                    </>
                    
                )
            })}
            <div className="modalLikes">
                <div className="close-modal">X</div>
                <div className="formLikes">
                    <h2>Curtidas</h2>
                    <ul>
                        {curtidas.map((val) => (
                            <div key={val.id} className="commentBox" style={{alignItems: 'center'}}>
                                <img src={val.info.profileImage} alt={val.info.userName} />
                                <p><b>{val.info.userName}</b></p>
                            </div>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="postHeader">
                <p>•••</p>
            </div>
            <div className="post-btn">
                <img src={fullHeart} alt="like" />
                <img src={commentIcon} alt="comment" />
            </div>
            {curtidas.length ? 
                <div className="likedby" >Curtido por <b>{curtidas[0].info.userName}</b>{curtidas.length > 1 ? ' e outros' : ''}</div>
            : <div></div>}
            {comentarios.length ? 
                <div className="commentsNumber">{comentarios.length === 1 ? 'Ver 1 comentário' : 'Ver ' + comentarios.length + ' comentários'}</div>
            : <div></div>}
        </div>
    )
}

export default Home