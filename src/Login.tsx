import { useState } from 'react';
import { authCreate, authSignIn, authUpdate, getURL, storagePut, storageRef } from './firebase'
import { abrirModal, fecharModal } from './functions';
import Logo from './images/logo-bioquimica.jpg'

interface IProps {
    user: any
    setUser: React.Dispatch<React.SetStateAction<any>>
}

function Login(props: IProps) {
    
    function criarConta(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const emailInput = document.getElementById('email-cadastro') as HTMLInputElement;
        const senhaInput = document.getElementById('senha-cadastro') as HTMLInputElement;
        const confsenhaInput = document.getElementById('confsenha-cadastro') as HTMLInputElement;
        const email = emailInput? emailInput.value : '';
        const senha = senhaInput? senhaInput.value: '';
        const confsenha = confsenhaInput? confsenhaInput.value: '';
        if (!email || !senha || !confsenha) {
            alert('Preencha todos os campos corretamente') 
        } else if (senha !== confsenha) {
            alert('As senhas não são iguais')
            senhaInput.value = '';
            confsenhaInput.value = '';
        } else {    
            authCreate(email, senha)
                .then((authUser) => {
                    authUpdate(authUser.user, {
                        displayName: email,
                        photoURL: 'https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keUll8CRQ3p3YaEv2M6qkVY5.jpg'
                    })
                    alert('Conta criada com sucesso!');
                    fecharModal('.modalCriarConta');
                })
                .catch((error) => {
                    alert(error.message)
                });  
        }
    }

    function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const emailInput = document.getElementById('email-login') as HTMLInputElement;
        const senhaInput = document.getElementById('senha-login') as HTMLInputElement;
        const email = emailInput? emailInput.value : '';
        const senha = senhaInput? senhaInput.value: '';
        authSignIn(email, senha)
            .then((auth) => {
                props.setUser(auth.user.displayName);
                alert(`Usuário ${auth.user.displayName} logado com sucesso!`);
                window.location.href = '/';          
            })
            .catch((error) => {
                alert(error.message)
            });
    }
    
    return (
        <>
            <div className='loginContent'>
                <div className="modalCriarConta">
                    <div onClick={() => fecharModal('.modalCriarConta')} className="close-modal">X</div>
                    <div className="formCriarConta">
                        <h2>Criar Conta</h2>
                        <form onSubmit={(e) => criarConta(e)}>
                            <input id='email-cadastro' type="text" placeholder='E-mail' />
                            <input id='senha-cadastro' type="password" placeholder='Senha' />
                            <input id='confsenha-cadastro' type="password" placeholder='Confirme sua senha' />
                            <input type="submit" value='Criar Conta!' />
                        </form>
                    </div>
                </div>
                <div className="dataLogin">
                    <div className="formLogin">
                        <h2>Horário de Aulas Prátias - LAPBIOQ</h2>
                        <img src={Logo} />
                        <form onSubmit={(e) => handleLogin(e)}>
                            <input id='email-login' type="text" placeholder='E-mail' />
                            <input id='senha-login' type="password" placeholder='Senha' />
                            <input type="submit" name='action' value='Entrar' />
                        </form>
                    </div>
                    <a onClick={(e) => abrirModal(e, '.modalCriarConta')} href="#">Criar conta</a>
                </div>
            </div> 
            <footer>©2024 Desenvolvido por Reinaldo Alves - Todos os direitos reservados</footer>
        </>
    )
}

export default Login