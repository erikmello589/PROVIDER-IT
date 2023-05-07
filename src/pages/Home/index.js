
import { useState } from 'react'
import { auth } from '../../firebaseConnection'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './index.css';

import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

import { toast } from 'react-toastify'



export default function Home(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const navigate = useNavigate();

  async function handleLogin(e){
    e.preventDefault();

    if(email !== '' && password !== ''){
      
      await signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // navegar para /admin
        navigate('/admin', { replace: true } )
      })
      .catch(() => {
        console.log("ERRO AO FAZER O LOGIN");
        toast.error("Erro ao fazer login");
      })

    }else{
      toast.error("Preencha todos os campos!");
    }


  }


  return(
  
    <div className="card">
      <form onSubmit={handleLogin}>
            <div className="flex flex-column md:flex-row">
                <div className="w-full md:w-5 flex flex-column align-items-s justify-content-center gap-3 py-5">
                    <div className="flex flex-wrap justify-content-center align-items-center gap-2">
                        <label htmlFor="username" className="w-6rem">
                            Email:
                        </label>
                        <InputText onChange={(e) => setEmail(e.target.value)} value={email} id="username" type="text" />
                    </div>
                    <div className="flex flex-wrap justify-content-center align-items-center gap-2">
                        <label htmlFor="password" className="w-6rem">
                            Senha:
                        </label>
                        <InputText onChange={(e) => setPassword(e.target.value)} value={password} id="password" type="password" />
                    </div>
                    <Button type='submit' label="Entrar" icon="pi pi-user" className="w-10rem mx-auto"></Button>
                </div>
                <div className="w-full md:w-2">
                    <Divider layout="vertical" className="hidden md:flex">
                        <b>OU</b>
                    </Divider>
                    <Divider layout="horizontal" className="flex md:hidden" align="center">
                        <b>OU</b>
                    </Divider>
                </div>
                <div className="w-full md:w-5 flex align-items-center justify-content-center py-5">
                    <Link to="/register"><Button label="Não tem uma conta ainda? Cadastre-se" icon="pi pi-user-plus" className="p-button-success"></Button></Link>
                </div>
            </div>
            </form>
        </div>

  )
}