import { useState } from 'react';
import { dbCollection, dbAdd, authSignOut } from './firebase'
import { v4 as uuidv4 } from 'uuid';
import { abrirModal, fecharModal } from './functions';
import { User } from 'firebase/auth';
import CateImg from './images/new_category.png';
import ItemImg from './images/new_item.png';
import { useNavigate } from 'react-router-dom';
import { ICategoria } from './types';

interface IProps {
    user: User,
    setUser: React.Dispatch<React.SetStateAction<any>>,
    categorias: Array<ICategoria>,
}

const defaultItem = {
    nome: '',
    quantidade: 0,
    categoria: ''
}

function SupplyMenu(props: IProps) {
    
    const [newItem, setNewItem] = useState(defaultItem);
    const [newCategoria, setNewCategoria] = useState('');

    const navigate = useNavigate();

    const updateProps = (property: 'nome' | 'quantidade' | 'categoria', newValue: any) => {
        setNewItem((prevData: any) => ({
            ...prevData,
            [property]: newValue
        }));
    };

    function handleLogout(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        authSignOut((val) => {
            props.setUser(null);
            window.location.href = '/estoque';
        })
    }

    function addItem() {
        if (newItem.nome) {
            const itensRef = dbCollection('itens');
            dbAdd(itensRef, uuidv4(), {
                nome: newItem.nome,
                quantidade: newItem.quantidade ?? 0,
                categoria: newItem.categoria ?? ''
            })
            alert('Item adicionado com sucesso!');
            fecharModal('.modalAddItem');
            setNewItem(defaultItem);
        } else {
            alert('Preencha o nome do item');
        }
    }

    function addCategoria() {
        const categoriasRef = dbCollection('categorias');
        dbAdd(categoriasRef, uuidv4(), {
            nome: newCategoria,
        })
        alert('Categoria adicionada com sucesso!');
        fecharModal('.modalAddCategory');
        setNewCategoria('');
    }
    
    return (
        <aside id='asideMenu'>
            <div className="modal modalSupplyMenu">
                <div onClick={() => fecharModal('.modalSupplyMenu')} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2>Menu Principal</h2>
                    <div className="main-menu-item" onClick={(e) => {
                        fecharModal('.modalSupplyMenu');
                        abrirModal(e, '.modalAddCategory');
                    }}>
                        <img src={CateImg} alt='Adicionar Categoria' />
                        <span>Adicionar Categoria</span>
                    </div>
                    <div className="main-menu-item" onClick={(e) => {
                        fecharModal('.modalSupplyMenu');
                        abrirModal(e, '.modalAddItem');
                    }}>
                        <img src={ItemImg} alt='Adicionar Item' />
                        <span>Adicionar Item</span>
                    </div>
                    <div className="main-menu-item" onClick={(e) => handleLogout(e)} >
                        <img src='https://cdn-icons-png.flaticon.com/512/126/126467.png' alt='Sair' />
                        <span>Sair</span>
                    </div>
                </div>
            </div>

            <div className="modal modalAddCategory">
                <div onClick={() => {
                    fecharModal('.modalAddCategory');
                    setNewCategoria('');
                }} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2>Adicionar Categoria</h2>
                    <form>
                        <label>Nome da Categoria</label>
                        <input value={newCategoria} onChange={(e) => setNewCategoria(e.target.value)}/>
                    </form>
                    <button onClick={() => addCategoria()} disabled={!newCategoria}>Adicionar</button>
                </div>
            </div>
            
            <div className="modal modalAddItem">
                <div onClick={() => {
                    fecharModal('.modalAddItem');
                    setNewItem(defaultItem);
                }} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2>Adicionar Item</h2>
                    <form>
                        <label>Nome do item</label>
                        <input type="text" value={newItem.nome} onChange={(e) => updateProps('nome', e.target.value)} />
                        <label>Quantidade em estoque</label>
                        <input type="number" min={0} value={newItem.quantidade} onChange={(e) => updateProps('quantidade', e.target.value)} />
                        <label>Categoria</label>
                        <select value={newItem.categoria} onChange={(e) => updateProps('categoria', e.target.value)}>
                            <option value=''></option>
                            {props.categorias.map((c => (
                                <option key={c.id} value={c.info.nome}>{c.info.nome}</option>
                            )))}
                        </select>
                    </form>
                    <button onClick={() => addItem()} disabled={!newItem.nome}>Adicionar</button>
                </div>
            </div>
            
            {props.user?.email ?
                <div className='btn-menu' onClick={(e) => abrirModal(e, '.modalSupplyMenu')}>Menu</div>
            :
                <button className='btn-login' onClick={() => navigate('/login')}>Login</button>
            }                   
        </aside> 
    )
}

export default SupplyMenu