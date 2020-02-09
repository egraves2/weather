import React, {useContext, useState} from 'react';
import './App.css';
import {Input, Button} from 'antd'
import {Bar} from 'react-chartjs-2'
import * as moment from 'moment'

const ButtonGroup = Button.Group
const context = React.createContext()

function App() {
  const [state, setState] = useState({
    searchTerm:'',
    mode:'hourly'
  })
  return <context.Provider value={{
    ...state,
    set: v=> setState({...state, ...v})
  }}>
    <div className="App">
      <Header/>
      <Body/>

    </div>
  </context.Provider>
}

const modes = ['daily', 'hourly']
function Header() {
  const ctx = useContext(context)
  const {loading, searchTerm, mode} = ctx
  return <header className="App-header">
    <Input 
      value={searchTerm} disabled={loading}
      onChange={e=> ctx.set({searchTerm:e.target.value})}
      style={{height:'3rem',fontSize:'2rem'}}
      onKeyPress={e=>{
        if(e.key==='Enter' && ctx.searchTerm) search(ctx)
      }}
    />
    <Button style={{marginLeft:5,height:48}}
      onClick={()=>search(ctx)} type="primary"
      disabled={!searchTerm} loading={loading}>
      Search
    </Button>
    <ButtonGroup style={{marginLeft:5, display:'flex'}}>
      {modes.map(m=>
        <Button style={{height:'3rem'}} 
          type={mode===m?'primary':'default'}
          onClick={()=> ctx.set({mode:m})}>
          {cap(m)}
        </Button>)}
    </ButtonGroup>
  </header>
}

function Body(){
  const ctx = useContext(context)
  const {error, weather, mode} = ctx
  console.log(weather)
  let data
  if(weather){
    data = {
      labels: weather[mode].data.map(d=>moment(d.time*1000).format('dd hh:mm')),
      datasets: [{
        label:'Temperature',
        data: weather[mode].data.map(d=>{
          if(mode==='hourly') return d.temperature
          else return (d.temperatureHigh+d.temperatureLow)/2
        }),
        backgroundColor: 'rgba(132,99,255,0.2)',
        borderColor: 'rgba(132,99,255,1)',
        hoverBackgroundColor: 'rgba(132,99,255,0.4)',
        hoverBorderColor: 'rgba(132,99,255,1)',
      }]
    }
  }
  return <div className="App-body">
      {error && <div className="error">{ctx.error}</div>}
      {weather && <div>
        <Bar data={data}
          width={800} height={400}
        />
        </div>}
  </div>
}

async function search({searchTerm, set}){
  try{
  const term = searchTerm
  console.log(searchTerm)
  set({error:'', loading:true})
  const key = 'b11ce50d643222475dd6b06efcf41d66'
  const osmurl = `https://nominatim.openstreetmap.org/search/${term}?format=json`
  const r = await fetch(osmurl)
  const loc = await r.json()
  const city = loc[0]
  if(!loc[0]){
    return set({error:'No city matching that query'})
  }
  const url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${key}/${city.lat},${city.lon}`
  const r2 = await fetch(url)
  const weather = await r2.json()
  set({weather, loading:false, searchTerm:''})
  } catch(e){
    set({error: e.message})
  }
}

function cap(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default App;
