import { abrirModal, fecharModal } from './functions';
import AulaImg from './images/class-schedule.png';
import SoluImg from './images/reg_solution.png';
import StorImg from './images/storage_control.png';
import { useNavigate } from 'react-router-dom';

const abrirModalApp = (e: React.MouseEvent<any>, selector: string) => {
    abrirModal(e, selector);
    const menu : HTMLElement | null = document.querySelector('#asideMenu');
    if (menu) {menu.style.visibility = 'hidden'};
};

const fecharModalApp = (selector: string) => {
    fecharModal(selector);
    const menu : HTMLElement | null = document.querySelector('#asideMenu');
    if (menu) {menu.style.visibility = 'visible'};
}

function AppMenu() {
    const navigate = useNavigate();
    
    return (
        <aside id='asideApps'>
            <div className="modal modalApps">
                <div onClick={() => fecharModalApp('.modalApps')} className="close-modal">X</div>
                <div className="modalContainer">
                    <h2>Outros Aplicativos</h2>
                    <div className="main-menu-item" style={{display: window.location.pathname === '/' ? 'none' : 'flex'}} onClick={() => navigate('/')}>
                        <img src={AulaImg} alt='Horário de Aulas Práticas' />
                        <span>Horário de Aulas Práticas</span>
                    </div>
                    <div className="main-menu-item" style={{display: window.location.pathname === '/solucoes' ? 'none' : 'flex'}} onClick={() => navigate('/solucoes')}>
                        <img src={SoluImg} alt='Preparação de Soluções' />
                        <span>Preparação de Soluções</span>
                    </div>
                    <div className="main-menu-item" style={{display: window.location.pathname === '/estoque' ? 'none' : 'flex'}} onClick={() => navigate('/estoque')}>
                        <img src={StorImg} alt='Controle de Estoque' />
                        <span>Controle de Estoque</span>
                    </div>
                </div>
            </div>
            
            <div className='btn-menu' onClick={(e) => abrirModalApp(e, '.modalApps')}>Apps</div>                  
        </aside>
        
    )
}

export default AppMenu