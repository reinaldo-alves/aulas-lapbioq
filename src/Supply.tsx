import AppMenu from "./AppMenu";
import { dbOnSnapshot, dbOrderBy, dbCollection, dbDel, dbEdt } from "./firebase";
import { abrirModal, fecharModal } from "./functions";
import { PageTitle } from "./PageTitle";
import SupplyMenu from "./SupplyMenu";
import { ICategoria, IItem } from "./types"
import { useEffect, useState } from "react";

interface IProps {
    user: any
    setUser: React.Dispatch<React.SetStateAction<any>>
}

const defaultCategoria = {
    id: '',
    info: {
        nome: ''
    }
}

function Supply(props: IProps) {
    
    const [categorias, setCategorias] = useState([] as Array<ICategoria>);
    const [itens, setItens] = useState([] as Array<IItem>);
    const [option, setOption] = useState('');
    const [editItem, setEditItem] = useState({} as IItem);
    const [editCategoria, setEditCategoria] = useState('');
    
    const clickSingleClass = (e: React.MouseEvent, item: IItem) => {
        if(props.user?.email) {
            setEditItem(item);
            abrirModal(e, `#id_item_${item.id}`);
        }
    }

    const clickCatHeader = (e: React.MouseEvent, cat: ICategoria) => {
        if(props.user?.email) {
            setEditCategoria(cat.info.nome);
            abrirModal(e, `#id_cat_${cat.id}`);
        }
    }
    
    const updateProps = (property: string, newValue: any) => {
        setEditItem((prevData: any) => ({
            ...prevData,
            info: {
                ...prevData.info,
                [property]: newValue
            }
        }));
    };

    const deleteItem = (item: IItem) => {
        const prosseguir = window.confirm('Tem certeza que quer excluir esse item?');
        if (prosseguir) {
            dbDel("itens", item.id);
            alert('Item excluído com sucesso');
            fecharModal(`#id_item_${item.id}`);
            setEditItem({} as IItem);
            setOption('');
        }
    }

    const handleEditItem = (item: IItem) => {
        dbEdt("itens", item.id, editItem.info);
        alert('Item editado com sucesso');
        fecharModal(`#id_item_${item.id}`);
        setEditItem({} as IItem);
        setOption('');
    }

    const changeQtd = (item: IItem, signal: number) => {
        const quant = Number(item.info.quantidade);
        const newQuant = quant + signal;
        if (newQuant >= 0) {
            dbEdt("itens", item.id, {quantidade: newQuant});
        }
    }

    const deleteCategoria = (cat: ICategoria) => {
        const prosseguir = window.confirm('Tem certeza que quer excluir essa categoria?');
        if (prosseguir) {
            itens.filter(i => i.info.categoria === cat.info.nome).forEach(i => dbEdt("itens", i.id, {categoria: ''}));
            dbDel("categorias", cat.id);
            alert('Categoria excluída com sucesso');
            fecharModal(`#id_cat_${cat.id}`);
            setEditCategoria('');
            setOption('');
        }
    }

    const handleEditCategoria = (cat: ICategoria) => {
        if(editCategoria !== cat.info.nome) {
            itens.filter(i => i.info.categoria === cat.info.nome).forEach(i => dbEdt("itens", i.id, {categoria: editCategoria}));
        }
        dbEdt("categorias", cat.id, {nome: editCategoria});
        alert('Categoria editada com sucesso');
        fecharModal(`#id_cat_${cat.id}`);
        setEditCategoria('');
        setOption('');
    }

    useEffect(() => {
        const dbQueryCa = dbOrderBy(dbCollection("categorias"), 'nome', 'asc');
        const unsubscribeCa = dbOnSnapshot(dbQueryCa, (querySnapshot) => {
          const categorias: ICategoria[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as ICategoria["info"]
            categorias.push({ id: doc.id, info: data });
          });
          setCategorias(categorias);
        });
        const dbQueryIt = dbOrderBy(dbCollection("itens"), 'nome', 'asc');
        const unsubscribeIt = dbOnSnapshot(dbQueryIt, (querySnapshot) => {
          const itens: IItem[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as IItem["info"]
            itens.push({ id: doc.id, info: data });
          });
          setItens(itens);
        });
        return () => {
            unsubscribeCa();
            unsubscribeIt();
        }
    }, [])
   
    return (
        <>
            <PageTitle title="Controle de Estoque" />
            <AppMenu />
            <SupplyMenu user={props.user} setUser={props.setUser} categorias={categorias} />
            <div className="mainContainer">
                <h1>Controle de Estoque</h1>
                {[...categorias, defaultCategoria].map(cat => {
                    return (
                        <div key={cat.id} style={{display: itens.filter(i => i.info.categoria === cat.info.nome).length > 0 ? 'block' : 'none'}}>
                            <div className="headerCategory">
                                <span onClick={(e) => clickCatHeader(e, cat)}>{cat.info.nome || 'Itens Sem Categoria'}</span>
                            </div>
                            <div className='bodyItem'>
                                {itens.filter(item => item.info.categoria === cat.info.nome).map(item => (
                                    <div className="class-item-container" key={item.id}>
                                        <span className="class-single" onClick={(e) => clickSingleClass(e, item)}>{item.info.nome}</span>
                                        {props.user?.email ?
                                            <div className="number-item-container">
                                                <div className="tec-icon" onClick={() => changeQtd(item, -1)} style={{backgroundColor: 'blueviolet', cursor: 'pointer'}}>-</div>
                                                <input type="number" readOnly value={item.info.quantidade} />
                                                <div className="tec-icon" onClick={() => changeQtd(item, 1)} style={{backgroundColor: 'blueviolet', cursor: 'pointer'}}>+</div>
                                            </div>
                                        :
                                            <span className="class-single">{item.info.quantidade}</span>
                                        }
                                        <div className="modal" id={`id_item_${item.id}`}>
                                            <div onClick={() => {
                                                fecharModal(`#id_item_${item.id}`);
                                                setEditItem({} as IItem);
                                                setOption('');
                                            }} className="close-modal">X</div>
                                            <div className="modalContainer modalSingleClass">
                                                <h2>{item.info.nome}</h2>
                                                <button onClick={() => setOption('editarItem')}>Editar Item</button>
                                                <br/>
                                                {option === 'editarItem' &&
                                                    <form>
                                                        <label>Nome do item</label>
                                                        <input type="text" value={editItem.info.nome} onChange={(e) => updateProps('nome', e.target.value)} />
                                                        <label>Quantidade</label>
                                                        <input type="number" min={0} value={editItem.info.quantidade} onChange={(e) => updateProps('quantidade', e.target.value)} />
                                                        <label>Categoria</label>
                                                        <select value={editItem.info.categoria} onChange={(e) => updateProps('categoria', e.target.value)}>
                                                            <option value=''>- Sem categoria -</option>
                                                            {categorias.map((cat => (
                                                                <option key={cat.id} value={cat.info.nome}>{cat.info.nome}</option>
                                                            )))}
                                                        </select>
                                                        <button onClick={() => handleEditItem(item)} disabled={!editItem.info.nome}>Salvar Alterações</button>
                                                    </form>}
                                                <button onClick={() => deleteItem(item)}>Excluir Item</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="modal" id={`id_cat_${cat.id}`}>
                                <div onClick={() => {
                                    fecharModal(`#id_cat_${cat.id}`);
                                    setEditCategoria('');
                                    setOption('');
                                }} className="close-modal">X</div>
                                <div className="modalContainer modalSingleClass">
                                    <h2>Categoria: {cat.info.nome}</h2>
                                    <button onClick={() => setOption('editarCat')}>Editar Categoria</button>
                                    <br/>
                                    {option === 'editarCat' &&
                                        <form>
                                            <label>Nome da categoria</label>
                                            <input type="text" value={editCategoria} onChange={(e) => setEditCategoria(e.target.value)} />
                                            <button onClick={() => handleEditCategoria(cat)}>Salvar Alterações</button>
                                        </form>}
                                    <button onClick={() => deleteCategoria(cat)}>Excluir Categoria</button>
                                </div>
                            </div>
                        </div>    
                    )
                })}
            </div>
        </>
    )
}

export default Supply