import React, { useState, useEffect } from 'react'
import './admin.css'

import { auth, db } from '../../firebaseConnection'
import { signOut } from 'firebase/auth'

import { toast } from 'react-toastify'

import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import InputMask from 'react-input-mask';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar';
import { confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { isEmpty } from "lodash";

import { ValidateCPF } from './utils/cpfUtil'
import { DateToString, StringToDate } from './utils/dateUtils'



import { 
  addDoc,
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore'

export default function Admin(){

  let fichaExemplo = {
    id: '',
    nome: '',
    dataNas: '',
    genero: '',
    cpf: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    telefone: '',
    userUid: ''
  };
  
  const [user, setUser] = useState({})
  const [fichas, setFichas] = useState([]);
  const [fichaAtual, setFichaAtual] = useState(fichaExemplo);
  const [apertouEdit, setApertouEdit] = useState(false);
  const [apertouNovo, setApertouNovo] = useState(false);
  const [globalFilter, setGlobalFilter] = useState(null);
  const [selectedFicha, setSelectedFicha] = useState(null);
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');

  const [errors, setErrors] = useState({
    nome: null,
    dataNas: null,
    genero: null,
    cpf: null,
    cep: null,
    endereco: null,
    numero: null,
    complemento: null,
    telefone: null,
  });

  const [exibeFormulario, setExibeFormulario] = useState(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nome: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    dataNas: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
});

  

  //FUNÇÃO ATUALIZAR SEMPRE TABELA
  useEffect(() => {
    async function loadFichas(){
      const userDetail = localStorage.getItem("@detailUser")
      setUser(JSON.parse(userDetail))

      if(userDetail){
        //const data = JSON.parse(userDetail);
        
        /*const fichasRef;
        const q = query(fichasRef, orderBy("created", "desc"), where("userUid", "==", data?.uid))*/

        const unsub = onSnapshot(collection(db, "fichas"), (snapshot) => {
          let lista = [];

          snapshot.forEach((doc)=> {
            lista.push({
              id: doc.id,
              nome: doc.data().nome,
              dataNas: new Date(StringToDate(doc.data().dataNas)),
              genero: doc.data().genero,
              cpf: doc.data().cpf,
              cep: doc.data().cep,
              endereco: doc.data().endereco,
              numero: doc.data().numero,
              complemento: doc.data().complemento,
              telefone: doc.data().telefone,
              userUid: doc.data().userUid
            })
          })
          
          setFichas(lista);


        })

      }

    }

    loadFichas();
  }, [])

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _ficha = { ...fichaAtual };

    _ficha[`${name}`] = val;

    setFichaAtual(_ficha);
};

const onCategoryChange = (e) => {
  let _ficha = { ...fichaAtual };

  _ficha['genero'] = e.value;
  setFichaAtual(_ficha);
};

  //ADCIONANDO UMA FICHA CADASTRAL
  async function registraFicha()
  {
    await addDoc(collection(db, "fichas"), 
    {
      created: new Date(),
      nome: fichaAtual.nome,
      dataNas: fichaAtual.dataNas,
      genero: fichaAtual.genero,
      cpf: fichaAtual.cpf,
      cep: fichaAtual.cep,
      endereco: fichaAtual.endereco,
      numero: fichaAtual.numero,
      complemento: fichaAtual.complemento,
      telefone: fichaAtual.telefone,
      userUid: user?.uid
    })
    .then(() => {
      toast.success("FICHA REGISTRADA")
    })
    .catch((error) => {
      toast.error("ERRO AO REGISTRAR " + error)
    })


  }

  //DESLOGANDO E INDO PARA TELA INICIAL
  async function handleLogout(){
    await signOut(auth);
  }

  //botões de DELETAR e EDITAR (lateral da tabela)
  const actionBodyTemplate = (ficha) => 
  {
    return (
        <React.Fragment>
            <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => exibeFormEdit(ficha)} />
            <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => apertouDelete(ficha.id)} />
        </React.Fragment>
    );
  };

  //Lateral Esquerda do cabeçalho, botão de CRIAR NOVA FICHA
  const leftToolbarTemplate = () => {
    return (
        <div className="flex flex-wrap gap-2">
            <Button label="Nova Ficha" icon="pi pi-plus" severity="success" onClick={exibeFormNovo}/>
            <InputText disabled value={nome} placeholder='Nome Selecionado'/>
            <InputText disabled value={data} placeholder='Data Selecionada'/>
        </div>
    );
};

const formatDate = (value) => {
  return value.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
  });
};

const dateBodyTemplate = (rowData) => {
  return formatDate(rowData.dataNas);
};

const dateFilterTemplate = (options) => {
  return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" mask="99/99/9999" />;
};

//cabeçalho da tabela, função pesquisa-geral
const header = (
  <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Pesquisa por palavra-chave</h4>
      <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Pesquisar por..." />
      </span>
  </div>
);

  //exibe um formulário com dois botões (um para cancelar e um para dar submit) e inputs pré-digitados da ficha atual para o usuário atualizar
  function exibeFormEdit (ficha)
  {
    setErrors({
      nome: null,
      dataNas: null,
      genero: null,
      cpf: null,
      cep: null,
      endereco: null,
      numero: null,
      complemento: null,
      telefone: null,
    });
    
      setFichaAtual({ ...ficha ,
      dataNas: DateToString(ficha.dataNas) });
      setApertouEdit(true);
      setApertouNovo(false);
      setExibeFormulario(true);
  }

  //exibe um formulário com dois botões (um para cancelar e um para dar submit) e inputs vazios para o usuário preenche-los
  function exibeFormNovo ()
  {
      setErrors({
        nome: null,
        dataNas: null,
        genero: null,
        cpf: null,
        cep: null,
        endereco: null,
        numero: null,
        complemento: null,
        telefone: null,
      })

      setFichaAtual(fichaExemplo);
      setApertouNovo(true);
      setApertouEdit(false);
      setExibeFormulario(true);
  }

  //atualiza o banco de dados com os inputs digitados no formulário de edição (ACONTECE APÓS OS 'SUBMIT')
  async function atualizaFicha (id)
  {
    const docRef = doc(db, "fichas", id)
    await updateDoc(docRef, {
      nome: fichaAtual.nome,
      dataNas: fichaAtual.dataNas,
      genero: fichaAtual.genero,
      cpf: fichaAtual.cpf,
      cep: fichaAtual.cep,
      endereco: fichaAtual.endereco,
      numero: fichaAtual.numero,
      complemento: fichaAtual.complemento,
      telefone: fichaAtual.telefone,
    })
    .then(() => {
      toast.success("Ficha atualizada com sucesso");
    })
    .catch(() => {
      toast.error("Erro ao atualizar no Banco de Dados");
    })
  }
  
  //POP-UP de interação para confirmar o desejo do usuário em deletar.
  function apertouDelete(id)
  {
    confirmDialog({
      message: 'Quer mesmo Deletar essa ficha?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteFicha(id),
      reject: () => toast.error("Operação Cancelada pelo usuário")
  });
  }

  //DELETANDO UMA FICHA CADASTRADA
  async function deleteFicha(id)
  {
    const docRef = doc(db, "fichas", id)
    await deleteDoc(docRef)
    toast.success("Ficha Deletada com sucesso");
  }

  const onRowSelect = (event) => {
    setNome(`${event.data.nome}`)
    setData(`${event.data.dataNas.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
  })}`)
};

  const onRowUnselect = (event) => {
    setNome('');
    setData('');
};

function consultaEndereco(cep)
{
  let cepF = cep.replace("-", "");

  let url = "https://viacep.com.br/ws/" + cepF + "/json/";
  
  fetch(url).then(function(response){
    response.json().then(function(dados)
    {
      fichaAtual.endereco = `${dados.logradouro}, ${dados.bairro} - ${dados.localidade} / ${dados.uf}`
      document.getElementById('endereco').value = `${dados.logradouro}, ${dados.bairro} - ${dados.localidade} / ${dados.uf}`
      document.getElementById('complemento').value = `${dados.complemento}`
      fichaAtual.complemento = `${dados.complemento}`
    })
    
  })
}

const handleSubmit = () => {
  let formIsValid = true;
 
  if (isEmpty(fichaAtual.dataNas)) {
    setErrors((prev) => ({ ...prev, dataNas: "Data de Nascimento é Obrigatória." }));
    formIsValid = false;
  } 
  else 
  {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() - 1)
    let dateEx = new Date(StringToDate(fichaAtual.dataNas))
    let [dia, mes] = fichaAtual.dataNas.split('/')
    

    if (dia < 1 || dia > 31 ||  mes < 1 || mes > 12)
    {
      setErrors((prev) => ({ ...prev, dataNas: "Insira uma data válida!" }));
      formIsValid = false;
    }
    else if  (dateEx > maxDate)
    {
      setErrors((prev) => ({ ...prev, dataNas: "Data Superior a Data limite!" }));
      formIsValid = false;
    }
    else
    {
      setErrors((prev) => ({ ...prev, dataNas: null }));
    }

  }

  if (isEmpty(fichaAtual.nome)) {
    setErrors((prev) => ({ ...prev, nome: "Nome é Obrigatório." }));
    formIsValid = false;
  } 
  else 
  {
    let names = fichaAtual.nome.split(" ");
    if (names.length < 2)
    {
      setErrors((prev) => ({ ...prev, nome: "Escreva pelo menos os dois primeiros nomes." }));
      formIsValid = false;
    } 
    else 
    {
      setErrors((prev) => ({ ...prev, nome: null }));
    }
  }

  if (isEmpty(fichaAtual.cpf)) {
    setErrors((prev) => ({ ...prev, cpf: "CPF é Obrigatório." }));
    formIsValid = false;
  } 
  else 
  {
    console.log(ValidateCPF(fichaAtual.cpf.valueOf()))
    if (ValidateCPF(fichaAtual.cpf.valueOf()) === false)
    {
      setErrors((prev) => ({ ...prev, cpf: "CPF Inválido." }));
      formIsValid = false;
    }
    else
    {
      setErrors((prev) => ({ ...prev, cpf: null }));
    }
  }

  if (isEmpty(fichaAtual.cep)) {
    setErrors((prev) => ({ ...prev, cep: "CEP é Obrigatório." }));
    formIsValid = false;
  } 
  else 
  {
    setErrors((prev) => ({ ...prev, cep: null }));
  }

  if (isEmpty(fichaAtual.endereco)) {
    setErrors((prev) => ({ ...prev, endereco: "Endereço é Obrigatório." }));
    formIsValid = false;
  } else {
    setErrors((prev) => ({ ...prev, endereco: null }));
  }

  if (isEmpty(fichaAtual.numero)) {
    setErrors((prev) => ({ ...prev, numero: "Número da residência é Obrigatório." }));
    formIsValid = false;
  } else {
    setErrors((prev) => ({ ...prev, numero: null }));
  }

  if (isEmpty(fichaAtual.telefone)) {
    setErrors((prev) => ({ ...prev, telefone: "Telefone para contato é Obrigatório." }));
    formIsValid = false;
  } else {
    setErrors((prev) => ({ ...prev, telefone: null }));
  }

  if (!fichaAtual.genero) {
    setErrors((prev) => ({ ...prev, genero: "Gênero é Obrigatório." }));
    formIsValid = false;
  } else {
    setErrors((prev) => ({ ...prev, genero: null }));
  }


  if (!formIsValid) 
  {
    toast.error("Revise Os Campos Obrigatórios/Preenchidos")
    return;
  }

  if(apertouEdit)
  {
    setExibeFormulario(false); 
    atualizaFicha(fichaAtual.id)
    return;
  }
  else
  {
    setExibeFormulario(false); 
    registraFicha();
    return;
  }
}
  
  return(

    <div className="admin-container">
      <div className="card">
            <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>
            <DataTable value={fichas} selectionMode="single" selection={selectedFicha} onSelectionChange={(e) => setSelectedFicha(e.value)} 
                       filters={filters} filterDisplay="menu" removableSort tableStyle={{ minWidth: '45rem' }} globalFilter={globalFilter} 
                       onRowSelect={onRowSelect} onRowUnselect={onRowUnselect} metaKeySelection={false} header={header}>
                <Column field="nome" filter filterPlaceholder="Buscar Nome" sortable header="Nome" style={{ width: '27%' }}></Column>
                <Column header="Data de Nascimento" filterField="dataNas" dataType="date" style={{ minWidth: '27%' }} body={dateBodyTemplate} filter filterElement={dateFilterTemplate} />
                <Column field="genero" sortable header="Gênero" style={{ width: '17%' }}></Column>
                <Column body={actionBodyTemplate} style={{ Width: '29%' }}></Column>
            </DataTable>
        </div>

        <div>
          <Dialog header="Ficha Cadastral - Provider IT" visible={exibeFormulario} className="p-fluid" style={{ width: '50vw' }} onHide={() => setExibeFormulario(false)}>
          
          <div className="field">
                    <label htmlFor="name" className="font-bold">Nome e Sobrenome:</label>
                    <InputText 
                    className={errors?.nome && "p-invalid"}
                    value={fichaAtual.nome}
                    onChange={(e) => onInputChange(e, 'nome')} 
                    autoFocus 
                    placeholder="Ex: Erik Mello"
                    />
                    {errors?.nome && <small className="p-error">{errors.nome}</small>}
          </div>

          <div className="field">
                    <label htmlFor="dataNas" className="font-bold">Data de Nascimento:</label>
                    <InputMask
                    className='p-inputtext'
                    id='dataNas'
                    value={fichaAtual.dataNas}
                    onChange={(e) => onInputChange(e, 'dataNas')}
                    autoFocus
                    placeholder="Ex: DD/MM/AAAA"
                    mask="99/99/9999"
                    />
                    {errors?.dataNas && <small className="p-error">{errors.dataNas}</small>}
          </div>

          <div className="field">
                    <label htmlFor="cpf" className="font-bold">CPF:</label>
                    <InputMask
                    className='p-inputtext'
                    value={fichaAtual.cpf}
                    onChange={(e) => onInputChange(e, 'cpf')}
                    autoFocus
                    placeholder="Ex: xxx.xxx.xxx-xx"
                    mask="999.999.999-99"
                    />
                    {errors?.cpf && <small className="p-error">{errors.cpf}</small>}
          </div>

          <div className="field">
          <div className="p-inputgroup">
                    <label htmlFor="cep" className="font-bold">CEP:</label>
                    <InputMask
                    className='p-inputtext'
                    value={fichaAtual.cep} 
                    onChange={(e) => onInputChange(e, 'cep')}
                    mask="99999-999" placeholder="Ex: xxxxx-xxx"/>
                    <Button onClick={()=> consultaEndereco(fichaAtual.cep)} icon="pi pi-search" className="p-button-warning" />
                    {errors?.cep && <small className="p-error">{errors.cep}</small>}
          </div>
          </div>

          <div className="field">
                    <label htmlFor="endereco" className="font-bold">Endereço:</label>
                    <InputText 
                    id='endereco'
                    className={errors?.endereco && "p-invalid"}
                    value={fichaAtual.endereco}
                    onChange={(e) => onInputChange(e, 'endereco')} 
                    autoFocus 
                    placeholder="Ex: Rua Clarimundo de Mello - Quintino / Rio de Janeiro - RJ"
                    />
                    {errors?.endereco && <small className="p-error">{errors.endereco}</small>}
          </div>

          <div className="field">
                    <label htmlFor="numero" className="font-bold">Número:</label>
                    <InputText 
                    className={errors?.numero && "p-invalid"}
                    value={fichaAtual.numero}
                    onChange={(e) => onInputChange(e, 'numero')} 
                    autoFocus 
                    placeholder="Ex: 179"
                    />
                    {errors?.numero && <small className="p-error">{errors.numero}</small>}
          </div>

          <div className="field">
                    <label htmlFor="complemento" className="font-bold">Complemento:</label>
                    <InputText
                    id='complemento'
                    value={fichaAtual.complemento}
                    onChange={(e) => onInputChange(e, 'complemento')} 
                    placeholder="Ex: fundos"
                   />
          </div>

          <div className="field">
                    <label htmlFor="telefone" className="font-bold">Telefone:</label>
                    <InputMask
                    className='p-inputtext'
                    value={fichaAtual.telefone} 
                    onChange={(e) => onInputChange(e, 'telefone')}
                    autoFocus 
                    mask="(99) 99999-9999" placeholder="(99) 99999-9999"
                    />
                    {errors?.telefone && <small className="p-error">{errors.telefone}</small>}
          </div>

          <br/>

          <div className="field">
            <div className="formgrid grid">
                    <label className="mb-3 font-bold">Gênero:</label>
                    <div className="formgrid grid">
                        <div className="field-radiobutton col-6">
                            <RadioButton name="category" value="Masculino" onChange={onCategoryChange} checked={fichaAtual.genero === 'Masculino'} />
                            <label htmlFor="category1">Masculino</label>
                        </div>
                        <div className="field-radiobutton col-6">
                            <RadioButton name="category" value="Feminino" onChange={onCategoryChange} checked={fichaAtual.genero === 'Feminino'} />
                            <label htmlFor="category2">Feminino</label>
                        </div>
                    </div>
                    {errors?.genero && <small className="p-error">{errors.genero}</small>}
                </div>
              </div>

              <div className='botoesForm'>
                <Button label="Cancelar" icon="pi pi-times" onClick={() => setExibeFormulario(false)} className="p-button-text" />
                <Button label="Salvar" icon="pi pi-check" onClick={handleSubmit} autoFocus />
              </div>
          </Dialog>
        </div>
                


      <button className="btn-logout" onClick={handleLogout}>Sair</button>

    </div>
  )
}