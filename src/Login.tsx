import { authSignIn } from './firebase'
import Logo from './images/logo-bioquimica.jpg'
import { useNavigate } from 'react-router-dom';

interface IProps {
    user: any
    setUser: React.Dispatch<React.SetStateAction<any>>
}

function Login(props: IProps) {
    
    const navigate = useNavigate();
    
    function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const emailInput = document.getElementById('email-login') as HTMLInputElement;
        const senhaInput = document.getElementById('senha-login') as HTMLInputElement;
        const email = emailInput? emailInput.value : '';
        const senha = senhaInput? senhaInput.value: '';
        authSignIn(email, senha)
            .then((auth) => {
                props.setUser(auth.user.email);
                window.location.href = '/';
                navigate('/');          
            })
            .catch((error) => {
                alert(error.message)
            });
    }
    
    return (
        <>
            <div className='loginContent'>
                <div className="dataLogin">
                    <div className="formLogin">
                        <h2>Horário de Aulas Prátias - LAPBIOQ</h2>
                        <img src={Logo} alt='DBIOq'/>
                        <form onSubmit={(e) => handleLogin(e)}>
                            <input id='email-login' type="text" placeholder='E-mail' />
                            <input id='senha-login' type="password" placeholder='Senha' />
                            <input type="submit" name='action' value='Entrar' />
                        </form>
                    </div>
                </div>
            </div> 
            <footer>©2024 Desenvolvido por Reinaldo Alves - Todos os direitos reservados</footer>
        </>
    )
}

export default Login