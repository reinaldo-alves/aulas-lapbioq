import { useState } from 'react';
import { storageRef, storagePut, getURL, dbCollection, dbAdd, serverTimestamp, authSignOut } from './firebase'
import { v4 as uuidv4 } from 'uuid';
import { abrirModal, fecharModal } from './functions';
import { User } from 'firebase/auth';
import Logo from './images/logo-bioquimica.jpg';
import AulaImg from './images/class.png';
import TecImg from './images/tecnician.png';
import HistImg from './images/history.png';
import { useNavigate } from 'react-router-dom';

interface IProps {
    user: User
    setUser: React.Dispatch<React.SetStateAction<any>>
}

function Header(props: IProps) {
    
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState<File | null>(null);

    const navigate = useNavigate();

    function handleLogout(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        authSignOut((val) => {
            props.setUser(null);
            alert('Você escolheu sair!');
            window.location.href = '/';
        })
    }

    function uploadPost(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const tituloPostInput = document.getElementById('titulo-upload') as HTMLInputElement;
        const tituloPost = tituloPostInput? tituloPostInput.value : '';
        if(file) {
            const uploadStorage = storageRef(`images/${file.name}`);
            const uploadTask = storagePut(uploadStorage, file)
            uploadTask.on('state_changed', (snapshot) => {
                const progress = Math.round(snapshot.bytesTransferred/snapshot.totalBytes) * 100;
                setProgress(progress);
            }, (error) => {console.log(error)}, () => {
                getURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    const postsRef = dbCollection('posts');
                    dbAdd(postsRef, uuidv4(), {
                        titulo: tituloPost,
                        image: downloadURL,
                        userName: props.user.displayName,
                        profileImage: props.user.photoURL,
                        timestamp: serverTimestamp()
                    })
                    setProgress(0);
                    setFile(null);
                    alert('Upload realizado com sucesso!')
                    const formUpload = document.getElementById('form-upload') as HTMLFormElement;
                    if(formUpload){
                        formUpload.reset();
                    }
                    fecharModal('.modalUpload');
                })
            })
        } else {
            alert('Adicione uma imagem válida')
        }
    }
    
    return (
        <aside>
            <div className="modalUpload">
                <div onClick={() => fecharModal('.modalUpload')} className="close-modal">X</div>
                <div className="formUpload">
                    <h2>Postar Foto</h2>
                    <form id='form-upload' onSubmit={(e) => uploadPost(e)}>
                        <progress id='progress-upload' value={progress}></progress>
                        <input id='titulo-upload' type="text" placeholder='Nome da sua foto...' />
                        <input onChange={(e) => setFile(e.target.files? e.target.files[0] : null)} type="file" name='file' />
                        <input type="submit" value='Postar no Instagram!' />
                    </form>
                </div>
            </div>
            
            <div className="center">
                <div className="header_logo">
                    <a className='logo-pict' href='/'><img src={Logo} alt='DBIOq'/></a>
                </div>
                <div className='header_icons'>
                    {props.user?.displayName ?
                        <>        
                            <div className="option-item" onClick={(e) => abrirModal(e, '.modalUpload')} >
                                <img src={TecImg} alt='Técnico' />
                                <span>Técnicos</span>
                            </div>
                            <div className="option-item">
                                <img src={AulaImg} alt='Aulas' />
                                <span>Aulas</span>
                            </div>
                            <div className="option-item" onClick={(e) => handleLogout(e)} >
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