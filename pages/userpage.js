import styles from '../styles/Userpage.module.css';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Navbar from '../components/Navbar';

import apiAgua from '../services/gotaapi';
import apiContas from '../services/backendapi';

import listaDeRegioes from '../utils/listaDeEmpresas.json';

export default function Userpage() {
  const router = useRouter();

  const [data, setData] = useState('');
  const [valor, setValor] = useState(0.0);
  const [consumo, setConsumo] = useState(0);
  const [status, setStatus] = useState(false);

  const [regiao, setRegiao] = useState('');
  const [listaDeEmpresas, setListaDeEmpresas] = useState([]);
  const [empresa, setEmpresa] = useState('');
  const [dadosEmpresa, setDadosEmpresa] = useState({});
  const [categoria, setCategoria] = useState('');
  const [listaDeCategorias, setListaDeCategorias] = useState([]);
  const [municipio, setMunicipio] = useState('todos');
  const [listaDeMunicipios, setListaDeMunicipios] = useState(['todos']);

  const [contasSalvas, setContasSalvas] = useState([]);

  let dados = {};

  const [renderMunicipio, setRenderMunicipio] = useState(null);

  useEffect(() => {
    const isLoged = localStorage.getItem('isLoged');
    if(!isLoged){
      router.push('/login');
    }
  }, []);

  useEffect(()=>{
    const headers = { 'Authorization': `${localStorage.getItem('userId')}`};

    apiContas.get('profile/bills', {headers}).then(response => {
      setContasSalvas(response.data);
    });
  }, [contasSalvas]);
  async function criarListaEmpresas(regiaoEscolhida) {
    if(regiaoEscolhida){
      const novaListaDeEmpresas = listaDeRegioes[regiaoEscolhida];
      setListaDeEmpresas(novaListaDeEmpresas);
    } 
  }

  async function getDadosDaEmpresa(nomeEmpresa) {
    nomeEmpresa = nomeEmpresa.toLowerCase();

    await apiAgua.get(`${regiao}/${nomeEmpresa}`).then(response => {
      dados = response.data;
    });

    setDadosEmpresa(dados);
    setListaDeMunicipios(dados.listaDeMunicipios);
    handleRenderMunicipio(dados.listaDeMunicipios);
  }

  function handleRenderMunicipio(listaDeMunicipios) {
    if (listaDeMunicipios[0] !== "todos") {
      setRenderMunicipio(<div className={styles.inputdiv} >
        <label htmlFor="empresa">Municipio:</label>
        <select
          name="empresa"
          id="empresa"
          onChange={e => { setMunicipio(e.target.value); getCategoria(e.target.value) }}
          required
        >
          <option value={''}>Escolha um municipio</option>
          {listaDeMunicipios.map(municipio =>
            <option key={municipio} value={municipio}>{municipio}</option>)}
        </select>
      </div>);
    }
    else {
      setRenderMunicipio(null);
      getCategoria();
    }
  }

  async function getCategoria() {
    setListaDeCategorias(dados.listaDeCategorias);
  }

  async function handleSalvarConta(e) {
    e.preventDefault();
    const dados = {
      data,
      valor,
      consumo,
      empresa,
      categoria,
      status,
      regiao,
      municipio
    }

    const headers = { 'Authorization': `${localStorage.getItem('userId')}`};

    try {
      await apiContas.post('profile/new_bill', dados, {headers});
      alert("Conta cadastrada com sucesso!")
    }
    catch (erro) {
      alert(erro.response.data.message);
    }
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Central do Usuário</h1>

        <div className={styles.formdiv}>
          <h2>Cadastrar conta</h2>
          <form onSubmit={handleSalvarConta}>
            <div className={styles.inputdiv}>
              <label htmlFor="data">Data:</label>
              <input
                type="date"
                name="data"
                id="data"
                value={data}
                onChange={e=> setData(e.target.value)}
                placeholder="Insira a data da sua conta"
                required
                autoFocus
              />
            </div>

            <div className={styles.inputdiv}>
              <label htmlFor="valor">Valor (R$):</label>
              <input
                type="number"
                name="valor"
                id="valor"
                step=".01"
                min="0.00"
                max="999999"
                value={valor}
                onChange={e=>setValor(e.target.value)}
                placeholder="Insira o valor da sua conta"
                required
              />
            </div>

            <div className={styles.inputdiv}>
              <label htmlFor="consumo">Consumo (m³):</label>
              <input
                type="number"
                name="consumo"
                id="consumo"
                step="1"
                min="0"
                max="999999"
                value={consumo}
                onChange={e => setConsumo(e.target.value)}
                placeholder="Insira o consumo da sua conta"
                required
              />
            </div>

            <div className={styles.inputdiv} >
              <label htmlFor="status">Status:</label>
              <select
                name="status"
                id="status"
                required
                onChange={e => setStatus(e.target.value)}
              >
                <option value={''}>Defina o status da sua conta</option>
                <option value={true}>Pago</option>
                <option value={false}>Pendente</option>
              </select>
            </div>

            <div className={styles.inputdiv} >
              <label htmlFor="regiao">Região:</label>
              <select
                name="regiao"
                id="regiao"
                onChange={e => { setRegiao(e.target.value); criarListaEmpresas(e.target.value) }}
                required
              >
                <option value={''} >Escolha uma região</option>
                <option value="df">Distrito Federal</option>
                <option value="go">Goiás</option>
                <option value="ms">Mato Grosso do Sul</option>
              </select>
            </div>

            <div className={styles.inputdiv} >
              <label htmlFor="empresa">Empresa de saneamento:</label>
              <select
                name="empresa"
                id="empresa"
                onChange={e => { setEmpresa(e.target.value); getDadosDaEmpresa(e.target.value) }}
                required
              >
                <option value={''}>Escolha uma empresa de saneamento</option>
                {listaDeEmpresas.map(empresa =>
                  <option key={empresa} value={empresa}>{empresa}</option>)}
              </select>
            </div>

            {renderMunicipio}

            <div className={styles.inputdiv} >
              <label htmlFor="categoria">Categoria:</label>
              <select
                name="categoria"
                id="categoria"
                onChange={e => setCategoria(e.target.value)}
                required
              >
                <option value={''}>Escolha uma categoria</option>
                {listaDeCategorias.map(nomeDaCategoria =>
                  <option key={nomeDaCategoria} value={nomeDaCategoria}>{nomeDaCategoria}</option>)}
              </select>
            </div>

            <button type="submit" className="clicavel">Salvar</button>
          </form>
        </div>

        <div className={styles.formdiv}>
          <h2>Contas salvas</h2>
          {contasSalvas.map(contaSalva => {
            let mostraMunicipio;
            if (contaSalva.municipio === 'todos') {
              mostraMunicipio = null;
            }
            else{
              mostraMunicipio = <p>Municipio: {contaSalva.municipio}</p>
            }
            return (
              <div className={styles.showdiv}>
                <p>Data: {contaSalva.data}</p>
                <p>Valor: R$ {contaSalva.valor}</p>
                <p>Consumo: {contaSalva.consumo} m³</p>
                <p>Região: {contaSalva.regiao}</p>
                <p>Empresa: {contaSalva.empresa}</p>
                {mostraMunicipio}
                <p>Categoria: {contaSalva.categoria}</p>
                <p>Status: {contaSalva.status ? 'Pago' : 'Pendente'}</p>
              </div>
            );
          })}
        </div>

        <div className={styles.formdiv}>
          <h2>Relatórios</h2>
        </div>

      </div>
    </>
  );
}