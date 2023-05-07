import { useState } from 'react'
import './index.css';

import { Link } from 'react-router-dom'
import { auth } from '../../firebaseConnection'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

import { toast } from 'react-toastify'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate();

  async function handleRegister(e){
    e.preventDefault();

    if(email !== '' && password !== ''){
      await createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate('/admin', { replace: true })
      })
      .catch(() => {
        toast.error("ERRO AO FAZER O CADASTRO")
      })


    }else{
      toast.error("Preencha todos os campos!")
    }


  }


  return(
    /*<div className="home-container">
      <h1>Cadastre-se</h1>
      <span>Vamos criar sua conta!</span>

      <form className="form" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Digite seu email..."
          value={email}
          onChange={(e) => setEmail(e.target.value) }
        />

        <input
          type="password"
          placeholder="******"
          value={password}
          onChange={(e) => setPassword(e.target.value) }
        />

        <button type="submit" >Cadastrar</button>
      </form>

      <Link className="button-link" to="/">
        Já possui uma conta? Faça login!
      </Link>

    </div>*/

    <div className="card">
      <form onSubmit={handleRegister}>
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
                    <Button type='submit' label="Cadastrar-me" icon="pi pi-user-plus" className="w-10rem mx-auto"></Button>
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
                    <Link to="/"><Button label="Já tem uma conta? Entre aqui!" icon="pi pi-user" className="p-button-success"></Button></Link>
                </div>
            </div>
            </form>
        </div>
  )
}