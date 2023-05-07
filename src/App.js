import { BrowserRouter } from 'react-router-dom'
import RoutesApp from './routes'
import { ToastContainer } from 'react-toastify'
import { ConfirmDialog } from 'primereact/confirmdialog';
import 'react-toastify/dist/ReactToastify.css';

export default function App(){
  return(
    <BrowserRouter>
      <ConfirmDialog/>
      <ToastContainer autoClose={3000} theme="colored"/>
      <RoutesApp/>
    </BrowserRouter>
  )
}